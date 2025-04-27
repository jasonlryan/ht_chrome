# OpenAI Integration Plan and Specification

## Goal

Turn raw MCP property data into Fact-check, Photo, Price, Location insights + Trust Score within < 3 seconds P95.

## Service Architecture

| Component          | Scope                                          | Tech                   | Path                               |
| ------------------ | ---------------------------------------------- | ---------------------- | ---------------------------------- |
| OpenAIOrchestrator | Single entry point called by /api/ask          | Node 18 + TypeScript   | backend/src/openai/orchestrator.ts |
| Prompt builder     | Deterministic prompt templates per insight     | EJS or string-literals | backend/src/openai/prompts/        |
| Function registry  | Maps OpenAI function-calling to internal utils | JSON Schema + zod      | backend/src/openai/functions.ts    |
| Cache              | 24h LRU keyed by {portalId, versionHash}       | Redis                  | redis://…                          |
| Streaming gateway  | SSE → Service Worker → content script          | express-sse            | /api/ask route                     |

## Environment Configuration

```
OPENAI_API_KEY = sk-…
OPENAI_MODEL = gpt-4o-mini # initial – switchable
OPENAI_TEMPERATURE = 0.2
OPENAI_QPM_LIMIT = 60
CACHE_TTL_SECONDS = 86400
OPENAI_TIMEOUT_MS = 8000
OPENAI_MAX_TOKENS = 700
OPENAI_MAX_INPUT_TOKENS = 6000
```

## API Interfaces

```typescript
export interface OpenAIRequest {
  listing: StandardisedProperty; // output of PortalExtractorService
  context?: {
    userId?: string;
    plan?: "free" | "premium";
    locale?: string;
    features?: string[];
  };
}

export interface OpenAIResponse {
  version: string; // API version
  data: {
    trustScore: number; // 0-100
    factCheck: FactCheckSection;
    photoAnalysis: PhotoSection;
    priceAnalysis: PriceSection;
    locationAnalysis: LocationSection;
    rawModelAnswer?: string; // kept 24h for audit
    partial?: boolean; // true if response was truncated
    parseError?: boolean; // true if schema validation failed
  };
}
```

## Orchestrator Implementation

```typescript
import pThrottle from "p-throttle";
import { openAIResponseSchema } from "./schemas";

// Rate limit OpenAI calls to stay within QPM limits
const throttledOpenAI = pThrottle({
  limit: +process.env.OPENAI_QPM_LIMIT,
  interval: 60 * 1000,
})(openai.chat.completions.create);

async function analyse(req: OpenAIRequest): Promise<OpenAIResponse> {
  // Include temperature in cache key for more precise caching
  const cacheKey = hash(
    `${req.listing.id}:${OPENAI_MODEL}:${OPENAI_TEMPERATURE}`
  );

  // Return cached result if available
  if (await redis.exists(cacheKey)) {
    const cached = await redis.get(cacheKey);
    Sentry.configureScope((scope) => {
      scope.setTag("cache_hit", true);
    });
    return cached;
  }

  Sentry.configureScope((scope) => {
    scope.setTag("cache_hit", false);
    scope.setTag("openai_model", process.env.OPENAI_MODEL);
  });

  // Check if input exceeds token limit
  if (estimateTokens(req) > +process.env.OPENAI_MAX_INPUT_TOKENS) {
    throw new Error("Input exceeds maximum token limit");
  }

  const { messages, functions } = buildPrompt(req);

  try {
    const stream = await throttledOpenAI({
      model: process.env.OPENAI_MODEL,
      temperature: +process.env.OPENAI_TEMPERATURE,
      max_tokens: +process.env.OPENAI_MAX_TOKENS,
      stream: true,
      messages,
      functions,
      timeout: +process.env.OPENAI_TIMEOUT_MS,
      headers: {
        "x-openai-proxy": "true",
      },
    });

    const parsedResult = await parseStream(stream); // handles fn calls

    // Validate against schema before caching
    try {
      const validated = openAIResponseSchema.parse(parsedResult);

      // Record token usage metrics
      Sentry.configureScope((scope) => {
        scope.setTag("prompt_tokens", parsedResult.usage?.prompt_tokens);
        scope.setTag(
          "completion_tokens",
          parsedResult.usage?.completion_tokens
        );
      });

      // Record usage for cost analysis
      recordUsageMetrics(req, {
        prompt: parsedResult.usage?.prompt_tokens,
        completion: parsedResult.usage?.completion_tokens,
      });

      const response = {
        version: "1",
        data: validated,
      };

      await redis.set(cacheKey, response, "EX", CACHE_TTL);
      return response;
    } catch (error) {
      Sentry.captureException(error, {
        extra: { parsedResult, error: error.message },
      });
      return {
        version: "1",
        data: {
          trustScore: null,
          parseError: true,
        },
      };
    }
  } catch (error) {
    // Fall back to GPT-3.5 on context length errors or rate limiting
    if (error.status === 429 || error.message.includes("context length")) {
      return fallbackToGpt35(req);
    }
    throw error;
  }
}
```

## Prompt Builder Implementation

```typescript
function buildPrompt(req: OpenAIRequest) {
  // More efficient prompt with direct JSON instead of markdown
  const systemPrompt = `You are HomeTruth AI. You will only ever see machine-generated JSON, NEVER natural language. Do not quote it back verbatim. If a field is unavailable return null, never invent values. Return JSON that conforms to the supplied schema.`;

  // Hash any UK postcodes for privacy
  const sanitizedListing = hashPostcodes(req.listing);

  // Use JSON instead of markdown table for token efficiency
  const userPrompt = JSON.stringify(sanitizedListing);

  // Rest of implementation with function definitions
  // ...

  return { messages, functions };
}

// Helper to hash postcodes for privacy
function hashPostcodes(listing) {
  // Deep clone the listing to avoid mutations
  const sanitized = JSON.parse(JSON.stringify(listing));

  // Find and hash full UK postcodes
  if (sanitized.address && sanitized.address.postcode) {
    sanitized.address.postcode = crypto
      .createHash("sha256")
      .update(sanitized.address.postcode)
      .digest("hex")
      .substring(0, 8);
  }

  return sanitized;
}
```

## Stream Parsing With Circuit Breakers

```typescript
async function parseStream(stream) {
  let functionCallCount = 0;
  let totalBytes = 0;
  let partialResult = {}; // Accumulate partial results

  for await (const chunk of stream) {
    totalBytes += JSON.stringify(chunk).length;

    // Process function calls
    if (chunk.choices[0]?.delta?.function_call) {
      functionCallCount++;

      // Circuit breaker to prevent runaway function calls or excessive data
      if (functionCallCount > 5 || totalBytes > 60000) {
        return { ...partialResult, partial: true };
      }

      // Process function call
      // ...
    }

    // Update partial result
    // ...
  }

  return finalResult;
}
```

## Streaming Gateway Implementation

```typescript
// In API route handler
app.post("/api/ask", async (req, res) => {
  // Set up SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      // OpenAI parameters
    });

    for await (const chunk of stream) {
      // Format chunk for consistent client handling
      res.write(
        `data: ${JSON.stringify({
          type: "chunk",
          payload: formatChunk(chunk),
        })}\n\n`
      );
    }

    // Send final result
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        payload: finalResult,
      })}\n\n`
    );

    // Add retry directive for automatic reconnection
    res.write(`retry: 4000\n\n`);

    res.end();
  } catch (error) {
    // Handle errors
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        payload: { message: "An error occurred" },
      })}\n\n`
    );
    res.end();
  }
});
```

## Error Handling

- HTTP 429 or context-length > 128k → fall back to gpt-3.5-turbo with summarised prompt
- Record openai_retry_count and openai_latency_ms in Sentry breadcrumbs for each request
- Implement circuit breakers to prevent runaway function calls
- Validate all responses against schema with graceful fallback

## Monitoring & Analytics

```typescript
function recordUsageMetrics(req, tokens) {
  analyticsService.track("openai_request", {
    model: process.env.OPENAI_MODEL,
    promptTokens: tokens.prompt,
    completionTokens: tokens.completion,
    totalCost: calculateCost(tokens, process.env.OPENAI_MODEL),
    cacheHit: false,
    propertyType: req.listing.propertyType,
    userPlan: req.context?.plan || "free",
  });
}

// Daily cost summary function
async function sendDailyCostSummary() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const usage = await analyticsService.query("openai_request", {
    date: yesterday,
    groupBy: ["model"],
  });

  const totalCost = usage.reduce((sum, record) => sum + record.totalCost, 0);

  await slackService.sendMessage({
    channel: "monitoring",
    text:
      `OpenAI Daily Usage (${yesterday.toISOString().split("T")[0]}):\n` +
      `Total cost: £${totalCost.toFixed(2)}\n` +
      `Requests: ${usage.length}\n` +
      `Models: ${usage
        .map((u) => `${u.model}: £${u.totalCost.toFixed(2)}`)
        .join(", ")}`,
  });
}
```

## CI/CD Integration

- GitHub Action runs npm run openai:test which hits OpenAI with tiny mock listing
- Validates schema integrity and fails pull-requests if JSON doesn't match zod schema

```json
"scripts": {
  "test:openai": "jest --testPathPattern=tests/openai/unit",
  "test:schema": "jest --testPathPattern=tests/openai/schema",
  "test:timeout": "jest --testPathPattern=tests/openai/timeout",
  "test:openai:all": "npm run test:openai && npm run test:schema && npm run test:timeout"
}
```

## Frontend Edge Case Handling

```typescript
// Client-side implementation
async function getPropertyAnalysis(propertyId) {
  // Show skeleton UI immediately
  uiStore.setLoading(true);

  try {
    const stream = await fetchEventSource("/api/ask", {
      method: "POST",
      body: JSON.stringify({ propertyId }),
      headers: {
        "X-HT-API-Version": "1",
      },
      onmessage: (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "chunk") {
          uiStore.updatePartialResult(data.payload);
        } else if (data.type === "done") {
          uiStore.setResult(data.payload);
          localStorage.setCache(propertyId, {
            data: data.payload,
            timestamp: Date.now(),
            ttl: parseInt(
              event.target.getResponseHeader("Cache-TTL") || "86400"
            ),
          });
        }
      },
    });
  } catch (error) {
    // Fall back to cached data if network fails
    const cached = localStorage.getCache(propertyId);
    if (cached) {
      uiStore.setResult({
        ...cached.data,
        stale: true,
      });
    } else {
      uiStore.setError("Failed to analyze property");
    }
  } finally {
    uiStore.setLoading(false);
  }
}

// First-time visit explainer
function FirstTimeExplainer() {
  return (
    <Tooltip visible={isFirstTime} position="bottom">
      <p>
        HomeTruth analysis is powered by AI and may be inaccurate. Always verify
        important information with official sources.
      </p>
    </Tooltip>
  );
}
```

## Compliance Requirements

- Add a disclaimer to user-facing docs explaining AI-generated content limitations
- Ensure fallback mechanisms when OpenAI is unavailable
- Document latency and cost budgets
- Maintain explicit schema contract between property extractor and AI
- Hash postcodes and other PII before sending to OpenAI
- Include clear AI disclaimer for first-time users
