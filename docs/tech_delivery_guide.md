# HomeTruth Technical Delivery Guide

## 1. Executive Summary

HomeTruth is a browser extension that gives home buyers accurate insights into real estate listings by analyzing data and detecting misleading claims. The system consists of a Chrome/Edge extension that integrates with popular property websites, a backend API powered by OpenAI's models, and a user portal for account management.

The architecture follows a "browser-first" approach with a lightweight extension that intercepts webpage content, sends it to our AI-powered backend for analysis, and injects insights directly into the property listing page. Key features include:

- Real-time fact-checking of property descriptions
- Detection of misleading photography techniques
- Historical price trend analysis with comparable properties
- Local amenity verification with walk scores
- Risk assessment for natural disasters, crime, and noise

This guide provides a comprehensive technical blueprint for implementing HomeTruth, from architecture specs to deployment pipelines, with detailed component guides and Cursor agent prompts that will enable efficient, parallel development. The 8-week delivery plan focuses on iterative development starting with core analysis features, followed by the extension UI, user portal, and finally the premium subscription features.

## 2. System Architecture

### Overview Flow Diagram

```
┌───────────────┐ 1. User visits ┌──────────────┐
│ Property Site │◄─────listing─────►│Browser + Ext │
└───────┬───────┘                └──────┬───────┘
        │                                │
        │ 2. Capture listing data        │
        │                                ▼
        │                        ┌─────────────┐
        │                        │ Extension   │
        │                        │ Content     │
        │                        │ Scripts     │
└───────────────────────────────►│             │
                                 └──────┬──────┘
                                        │
                                        │ 3. Extract & process data
                                        │
                                        ▼
┌───────────────┐    5. Return    ┌──────────────┐
│ Extension     │◄─────analysis────┤ Backend API  │
│ UI Overlay    │                  │              │
└───────────────┘                  └──────┬───────┘
                                          │
                                          │ 4. AI Analysis
                                          │
┌───────────────────┐                     │
│ User Portal       │                     ▼
│ ┌────────────┐    │             ┌─────────────┐
│ │ Account    │    │             │ OpenAI API  │
│ │ Management │    │             │             │
│ └────────────┘    │             └─────────────┘
│ ┌────────────┐    │
│ │ Billing    │    │
│ └────────────┘    │
└───────────────────┘
```

### Component Table

| Component         | Technology                   | Repository          | Description                                                |
| ----------------- | ---------------------------- | ------------------- | ---------------------------------------------------------- |
| Browser Extension | TypeScript, React, Plasmo    | hometruth-extension | Chrome/Edge extension with content scripts and UI overlay  |
| Backend API       | Node.js, Express, TypeScript | hometruth-api       | RESTful API for data processing and OpenAI integration     |
| User Portal       | Next.js, React, TypeScript   | hometruth-portal    | Web app for account management and billing                 |
| Database          | PostgreSQL                   | -                   | Data store for user accounts, history, and cached analysis |
| Authentication    | Auth0                        | -                   | User authentication and authorization                      |
| Monitoring        | Sentry                       | -                   | Error tracking and performance monitoring                  |
| DevOps Pipeline   | GitHub Actions, Docker       | -                   | CI/CD pipeline for automated testing and deployment        |

## 3. Detailed Component Specs

### 3.1 Browser Extension

#### Responsibility & Boundaries

- Detect and process property listing pages
- Extract relevant listing data (text, images, prices, coordinates)
- Send data to backend API for analysis
- Inject analysis results into the property page UI
- Handle user interactions within the extension UI
- Store user preferences and authentication tokens
- Support offline mode with cached analysis

#### External APIs/Interfaces

```typescript
// Main controller interface
interface ExtensionController {
  initialize(): Promise<void>;
  analyzeCurrentPage(): Promise<AnalysisResult>;
  toggleExtension(enabled: boolean): void;
  getUserStatus(): UserStatus;
  logout(): void;
}

// Content script interface
interface ContentScript {
  extractListingData(): Promise<PropertyListing>;
  injectAnalysisUI(analysis: AnalysisResult): void;
  removeInjectedElements(): void;
}

// API client interface
interface APIClient {
  analyzeProperty(data: PropertyListing): Promise<AnalysisResult>;
  authenticate(token: string): Promise<UserStatus>;
  trackAnalysisView(listingId: string): Promise<void>;
}
```

#### Data Models / Schemas

```typescript
interface PropertyListing {
  url: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[]; // URLs of property images
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  features: {
    bedrooms?: number;
    bathrooms?: number;
    area?: number; // in sq ft/m
    propertyType?: string;
    yearBuilt?: number;
  };
  metadata: {
    listingId: string;
    source: string; // e.g., "zillow", "redfin"
    extractedAt: string; // ISO timestamp
  };
}

interface AnalysisResult {
  summary: {
    trustScore: number; // 0-100
    redFlags: number;
    recommendations: string[];
  };
  factCheck: {
    claims: Array<{
      statement: string;
      assessment: "true" | "misleading" | "false" | "unverifiable";
      confidence: number; // 0-1
      explanation: string;
    }>;
  };
  photoAnalysis: {
    techniques: Array<{
      type: string; // e.g., "wide-angle", "staged"
      detected: boolean;
      confidence: number; // 0-1
      explanation: string;
    }>;
  };
  priceAnalysis: {
    fairMarketEstimate: number;
    comparables: Array<{
      address: string;
      price: number;
      soldDate: string;
      similarity: number; // 0-1
    }>;
    priceHistory: Array<{
      date: string;
      price: number;
      event: "listed" | "price_change" | "sold" | "relisted";
    }>;
  };
  locationAnalysis: {
    amenities: {
      transit: {
        score: number; // 0-10
        details: string;
      };
      shopping: {
        score: number;
        details: string;
      };
      schools: {
        score: number;
        details: string;
      };
      restaurants: {
        score: number;
        details: string;
      };
    };
    risks: {
      flood: {
        score: number; // 0-10, higher = higher risk
        details: string;
      };
      wildfire: {
        score: number;
        details: string;
      };
      crime: {
        score: number;
        details: string;
      };
      noise: {
        score: number;
        details: string;
      };
    };
  };
}

interface UserStatus {
  authenticated: boolean;
  subscription: {
    type: "free" | "premium";
    expiresAt: string | null;
    features: string[];
  };
  usage: {
    analysisCount: number;
    remainingCredits: number;
  };
}
```

#### Error Handling & Observability

```typescript
// Error types
enum ErrorType {
  NETWORK_ERROR = "network_error",
  EXTRACTION_ERROR = "extraction_error",
  API_ERROR = "api_error",
  RENDERING_ERROR = "rendering_error",
  AUTHENTICATION_ERROR = "auth_error",
}

// Error handling interface
interface ErrorHandler {
  captureError(
    error: Error,
    type: ErrorType,
    context?: Record<string, any>
  ): void;
  getLastError(): Error | null;
  showErrorNotification(message: string): void;
}

// Analytics/Telemetry interface
interface Analytics {
  trackPageView(url: string): void;
  trackAnalysisRequest(listingId: string): void;
  trackFeatureUsage(featureName: string): void;
  trackError(errorType: ErrorType, message: string): void;
  trackPerformance(metric: string, durationMs: number): void;
}
```

### 3.2 Backend API

#### Responsibility & Boundaries

- Process data from the extension
- Communicate with OpenAI API for analysis
- Maintain user account and subscription data
- Cache analysis results to reduce API costs
- Provide endpoints for user portal integration
- Handle authentication and authorization
- Log and monitor system performance

#### External APIs/Interfaces

```typescript
// Main API interface
interface HomeTruthAPI {
  // Analysis endpoints
  analyzeProperty(req: Request, res: Response): Promise<void>;
  getAnalysisHistory(req: Request, res: Response): Promise<void>;

  // User management endpoints
  createUser(req: Request, res: Response): Promise<void>;
  updateUser(req: Request, res: Response): Promise<void>;
  getUser(req: Request, res: Response): Promise<void>;

  // Subscription endpoints
  createSubscription(req: Request, res: Response): Promise<void>;
  cancelSubscription(req: Request, res: Response): Promise<void>;
  getSubscriptionStatus(req: Request, res: Response): Promise<void>;

  // Authentication endpoints
  validateToken(req: Request, res: Response): Promise<void>;
  refreshToken(req: Request, res: Response): Promise<void>;
}

// OpenAI service interface
interface OpenAIService {
  analyzeDescription(description: string): Promise<FactCheckResult>;
  analyzeImages(imageUrls: string[]): Promise<PhotoAnalysisResult>;
  analyzePricing(
    listing: PropertyListing,
    comparables: ComparableProperty[]
  ): Promise<PriceAnalysisResult>;
  analyzeLocation(coordinates: {
    latitude: number;
    longitude: number;
  }): Promise<LocationAnalysisResult>;
}

// External data service interface
interface DataService {
  getComparableProperties(
    listing: PropertyListing
  ): Promise<ComparableProperty[]>;
  getPriceHistory(propertyId: string): Promise<PriceHistoryEntry[]>;
  getLocalAmenities(coordinates: {
    latitude: number;
    longitude: number;
  }): Promise<Amenity[]>;
  getRiskAssessment(coordinates: {
    latitude: number;
    longitude: number;
  }): Promise<RiskAssessment>;
}

// Cache service interface
interface CacheService {
  getAnalysis(listingId: string): Promise<AnalysisResult | null>;
  cacheAnalysis(listingId: string, analysis: AnalysisResult): Promise<void>;
  invalidateAnalysis(listingId: string): Promise<void>;
}
```

#### Data Models / Schemas

```typescript
// Database schema definitions
interface User {
  id: string;
  email: string;
  createdAt: Date;
  lastLoginAt: Date;
  subscription: {
    type: "free" | "premium";
    startDate: Date;
    endDate: Date | null;
    status: "active" | "canceled" | "expired";
    paymentProvider: "stripe" | null;
    paymentId: string | null;
  };
  settings: {
    defaultView: string;
    notifications: boolean;
  };
}

interface AnalysisRecord {
  id: string;
  userId: string;
  listingId: string;
  listingUrl: string;
  createdAt: Date;
  result: AnalysisResult;
  expiresAt: Date;
}

interface ComparableProperty {
  id: string;
  address: string;
  price: number;
  soldDate: Date;
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    yearBuilt: number;
  };
  distance: number; // in miles/km from original listing
}

interface PriceHistoryEntry {
  date: Date;
  price: number;
  event: "listed" | "price_change" | "sold" | "relisted";
}

interface Amenity {
  type: "transit" | "shopping" | "school" | "restaurant" | "park";
  name: string;
  distance: number; // in miles/km
  rating?: number; // 0-5 stars
}

interface RiskAssessment {
  flood: {
    score: number; // 0-10
    details: string;
  };
  wildfire: {
    score: number;
    details: string;
  };
  crime: {
    score: number;
    details: string;
  };
  noise: {
    score: number;
    details: string;
  };
}
```

#### Error Handling & Observability

```typescript
// API error response format
interface APIErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: Record<string, any>;
  requestId: string;
}

// Logging interface
interface Logger {
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, error?: Error, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
}

// Metrics interface
interface Metrics {
  incrementCounter(name: string, tags?: Record<string, string>): void;
  recordTiming(
    name: string,
    timeMs: number,
    tags?: Record<string, string>
  ): void;
  gaugeValue(name: string, value: number, tags?: Record<string, string>): void;
}
```

### 3.3 User Portal

#### Responsibility & Boundaries

- Provide user account management
- Display analysis history
- Handle subscription management
- Show usage metrics and limits
- Support user feedback and help
- Provide account settings configuration

#### External APIs/Interfaces

```typescript
// Portal API interface
interface UserPortalAPI {
  // User data endpoints
  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile>;

  // Analysis history endpoints
  getAnalysisHistory(
    page: number,
    limit: number
  ): Promise<PaginatedResponse<AnalysisRecord>>;
  getAnalysisDetails(analysisId: string): Promise<AnalysisResult>;

  // Subscription endpoints
  getSubscriptionOptions(): Promise<SubscriptionPlan[]>;
  getCurrentSubscription(): Promise<Subscription>;
  updateSubscription(planId: string): Promise<Subscription>;
  cancelSubscription(): Promise<void>;

  // Billing endpoints
  getBillingHistory(): Promise<BillingRecord[]>;
  updatePaymentMethod(paymentDetails: PaymentMethod): Promise<void>;
}
```

#### Data Models / Schemas

```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  preferences: {
    emailNotifications: boolean;
    defaultView: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
}

interface Subscription {
  planId: string;
  planName: string;
  status: "active" | "canceled" | "expired";
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  nextBillingDate: string | null;
}

interface BillingRecord {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: "paid" | "pending" | "failed";
  description: string;
  receiptUrl: string | null;
}

interface PaymentMethod {
  type: "credit_card" | "paypal";
  details: Record<string, any>; // Provider-specific details
}
```

#### Error Handling & Observability

```typescript
// Portal error handling
interface PortalErrorHandler {
  handleAPIError(error: any): void;
  showErrorNotification(message: string): void;
  logClientError(error: Error): void;
}

// Portal analytics
interface PortalAnalytics {
  trackPageView(page: string): void;
  trackEvent(category: string, action: string, label?: string): void;
  trackSubscriptionChange(plan: string): void;
}
```

## 4. Security & Compliance Checklist

### 4.1 Data Security

All API endpoints require authentication via JWT tokens
HTTPS enforced for all communications
API rate limiting to prevent abuse
Input validation and sanitization on all endpoints
Secrets stored in environment variables, not in code
Database connection strings and API keys rotated regularly
Database encryption at rest
Audit logs for all sensitive operations

### 4.2 GDPR Compliance

Clear privacy policy that outlines data collection and processing
User consent mechanism for data collection
Data minimization: only collect what's necessary
User data export functionality
User account deletion functionality with data removal
Data retention policy implementation (30 days for non-subscribers)
Breach notification process documented
DPA (Data Processing Agreement) with OpenAI and other services

### 4.3 Chrome Web Store Compliance

Manifest V3 compatibility
Permissions minimized and justified
Clear description of extension functionality
Privacy policy link in store listing
Support contact information provided
All APIs used are documented in the permissions
No prohibited content collection
No deceptive installation tactics
Regular updates to maintain security standards

### 4.4 Portal Terms of Service Compliance

Clear terms of service document
Acceptable use policy
Definition of subscription terms and billing
Cancellation and refund policy
Service level agreements
Intellectual property rights statement
Limitation of liability clauses
Terms update notification process

## 5. Deployment & DevOps Pipeline

### 5.1 GitHub Branch Strategy

```
main # Production-ready code
├── develop # Integration branch
│ ├── feature/_ # Feature branches
│ ├── bugfix/_ # Bug fix branches
│ └── docs/_ # Documentation branches
├── hotfix/_ # Urgent production fixes
└── release/* # Release candidate branches
```

### 5.2 CI/CD Pipeline

```
┌────────────┐ ┌─────────────┐ ┌────────────┐ ┌───────────┐
│ Push Code │────►│ Run Tests │────►│ Build │────►│ Deploy │
└────────────┘ └─────────────┘ └────────────┘ └───────────┘
│ │ │
▼ ▼ ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Unit Tests │ │ Build API │ │ Deploy to │
└─────────────┘ └─────────────┘ │ Dev/Staging │
│ │ └─────────────┘
▼ ▼ │
│ ┌─────────────┐ │
└─────────►│ Build Portal│ │
└─────────────┘ │
│ ▼
│ ┌─────────────┐
└──────────►│ Deploy to │
│ Production │
└─────────────┘
```

### 5.3 GitHub Actions Configuration

```yaml
# Main CI workflow
name: CI Pipeline

on:
push:
branches: [ main, develop, release/*, hotfix/* ]
pull_request:
branches: [ main, develop ]

jobs:
test:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v3 - name: Set up Node.js
uses: actions/setup-node@v3
with:
node-version: '18' - name: Install dependencies
run: npm ci - name: Run linting
run: npm run lint - name: Run unit tests
run: npm run test:unit - name: Run integration tests
run: npm run test:integration - name: Upload test coverage
uses: actions/upload-artifact@v3
with:
name: coverage
path: coverage/

build:
needs: test
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v3 - name: Set up Node.js
uses: actions/setup-node@v3
with:
node-version: '18' - name: Install dependencies
run: npm ci - name: Build API
run: npm run build:api - name: Build Extension
run: npm run build:extension - name: Build Portal
run: npm run build:portal - name: Upload build artifacts
uses: actions/upload-artifact@v3
with:
name: build-artifacts
path: dist/

deploy-staging:
if: github.ref == 'refs/heads/develop'
needs: build
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v3 - name: Download build artifacts
uses: actions/download-artifact@v3
with:
name: build-artifacts
path: dist/ - name: Deploy API to staging
run: ./scripts/deploy-api.sh staging - name: Deploy Portal to staging
run: ./scripts/deploy-portal.sh staging - name: Submit extension to test channel
run: ./scripts/submit-extension.sh testing

deploy-production:
if: github.ref == 'refs/heads/main'
needs: build
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v3 - name: Download build artifacts
uses: actions/download-artifact@v3
with:
name: build-artifacts
path: dist/ - name: Deploy API to production
run: ./scripts/deploy-api.sh production - name: Deploy Portal to production
run: ./scripts/deploy-portal.sh production - name: Submit extension to production
run: ./scripts/submit-extension.sh production
```

### 5.4 Plasmo Build Configuration

```typescript
// plasmo.config.ts
import { PlasmoConfig } from "plasmo";

const config: PlasmoConfig = {
  manifest: {
    manifest_version: 3,
    name: "HomeTruth",
    version: "1.0.0",
    description: "Get the unbiased truth about real estate listings",
    permissions: ["storage", "activeTab", "scripting", "identity"],
    host_permissions: [
      "https://*.zillow.com/*",
      "https://*.redfin.com/*",
      "https://*.realtor.com/*",
      "https://*.trulia.com/*",
      "https://api.hometruth.io/*",
    ],
    action: {
      default_popup: "popup.html",
      default_icon: {
        "16": "assets/icon16.png",
        "48": "assets/icon48.png",
        "128": "assets/icon128.png",
      },
    },
    content_scripts: [
      {
        matches: [
          "https://*.zillow.com/*",
          "https://*.redfin.com/*",
          "https://*.realtor.com/*",
          "https://*.trulia.com/*",
        ],
        js: ["content.ts"],
      },
    ],
  },
  server: {
    port: 1234,
    host: "localhost",
  },
  build: {
    targetBrowser: ["chrome", "edge"],
    tsconfigPath: "./tsconfig.build.json",
    sourcemap: process.env.NODE_ENV !== "production",
  },
};

export default config;
```

### 5.5 Container Registry Configuration

```yaml
# Docker configuration

# api/Dockerfile

FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production
CMD ["node", "dist/index.js"]

# docker-compose.yml

version: '3.8'
services:
api:
build: ./api
ports: - "3000:3000"
environment: - NODE_ENV=production - DB_CONNECTION=postgres://user:password@db:5432/hometruth - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
depends_on: - db
restart: always

portal:
build: ./portal
ports: - "3001:3000"
environment: - NODE_ENV=production - API_URL=http://api:3000
depends_on: - api
restart: always

db:
image: postgres:15
volumes: - postgres_data:/var/lib/postgresql/data
environment: - POSTGRES_USER=user - POSTGRES_PASSWORD=password - POSTGRES_DB=hometruth
restart: always

volumes:
postgres_data:
```

### 5.6 Sentry Setup

```typescript
// sentry.config.ts
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

export const configureSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [new ProfilingIntegration()],
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Keep the most recent 10 errors in the queue for reporting
    maxBreadcrumbs: 10,

    // Add performance measurement
    enableTracing: true,

    // Add user feedback collection
    beforeSend(event) {
      if (event.user) {
        // Don't send email addresses to Sentry
        delete event.user.email;
      }
      return event;
    },
  });
};

// Extension-specific Sentry setup
// extension/src/sentry.ts
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.1,
    release: process.env.EXTENSION_VERSION,
  });
};
```

## 6. Testing Strategy

### 6.1 Testing Overview

| Test Type         | Coverage Target | Tools                       | Responsibility        |
| ----------------- | --------------- | --------------------------- | --------------------- |
| Unit Tests        | 85%             | Jest, React Testing Library | Individual developers |
| Integration Tests | 70%             | Supertest, Jest             | Team leads            |
| E2E Tests         | Critical paths  | Puppeteer                   | QA team               |
| Performance Tests | -               | k6, Lighthouse              | DevOps team           |
| Security Tests    | -               | OWASP ZAP, npm audit        | Security team         |

### 6.2 Unit Testing

```typescript
// Example unit test for the extension's analysis processor
import { processAnalysisResponse } from "../src/processors/analysisProcessor";

describe("Analysis Processor", () => {
  test("should format analysis response correctly", () => {
    // Arrange
    const mockApiResponse = {
      summary: {
        trustScore: 75,
        redFlags: 2,
        recommendations: [
          "Check the price history",
          "Verify flood risk claims",
        ],
      },
      factCheck: {
        claims: [
          {
            statement: "Recently renovated kitchen",
            assessment: "true",
            confidence: 0.92,
            explanation:
              "Property records confirm a kitchen renovation in 2023",
          },
        ],
      },
    };

    // Act
    const result = processAnalysisResponse(mockApiResponse);

    // Assert
    expect(result.summary.trustScore).toBe(75);
    expect(result.factCheck.claims).toHaveLength(1);
    expect(result.factCheck.claims[0].assessment).toBe("true");
  });
});
```

### 6.3 Integration Testing

```typescript
// Example API integration test
import request from "supertest";
import { app } from "../src/app";
import { generateTestToken } from "./helpers/auth";

describe("Property Analysis API", () => {
  test("should return analysis for valid property data", async () => {
    // Arrange
    const token = generateTestToken("test-user");
    const propertyData = {
      url: "https://www.zillow.com/homedetails/123-main-st",
      title: "Beautiful 3-bedroom home",
      description: "Recently renovated with modern kitchen and bath",
      price: 450000,
      // Other required properties
    };

    // Act
    const response = await request(app)
      .post("/api/v1/analysis")
      .set("Authorization", `Bearer ${token}`)
      .send(propertyData);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("summary");
    expect(response.body).toHaveProperty("factCheck");
  });
});
```

### 6.4 E2E Testing

```typescript
// Example Puppeteer E2E test
import puppeteer from "puppeteer";

describe("Extension E2E Tests", () => {
  test("should load and analyze a property page", async () => {
    // Arrange
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-extensions-except=./dist", "--load-extension=./dist"],
    });
    const page = await browser.newPage();

    // Act
    await page.goto("https://www.zillow.com/homedetails/123-main-st");
    await page.waitForSelector("#hometruth-container", { timeout: 10000 });

    // Assert
    const trustScore = await page.$eval(
      "#hometruth-trust-score",
      (el) => el.textContent
    );
    expect(trustScore).toBeTruthy();

    // Cleanup
    await browser.close();
  }, 30000);
});
```

### 6.5 Performance Testing

```javascript
// k6 performance test script
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // Ramp up to 10 users
    { duration: "1m", target: 10 }, // Stay at 10 users for 1 minute
    { duration: "30s", target: 50 }, // Ramp up to 50 users
    { duration: "1m", target: 50 }, // Stay at 50 users for 1 minute
    { duration: "30s", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests should be below 500ms
    http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail
  },
};

export default function () {
  const payload = JSON.stringify({
    url: "https://www.zillow.com/homedetails/123-main-st",
    title: "Beautiful 3-bedroom home",
    description: "Recently renovated with modern kitchen and bath",
    price: 450000,
    // Other required fields
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${__ENV.TEST_TOKEN}`,
    },
  };

  const res = http.post(
    "https://api.hometruth.io/v1/analysis",
    payload,
    params
  );

  check(res, {
    "is status 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
    "contains analysis": (r) => r.json().hasOwnProperty("summary"),
  });

  sleep(1);
}
```

## 7. Milestone & Sprint Plan (8-week timeline)

### Sprint 1 (Weeks 1-2): Foundation & Core Backend

- Set up project repositories and environments
- Implement core backend infrastructure
- Create basic data models and database schema
- Establish OpenAI integration for property analysis
- Set up CI/CD pipeline and deployment workflow

**Deliverables**: Functional backend API with basic analysis capabilities

### Sprint 2 (Weeks 3-4): Extension Development

- Implement browser extension foundation
- Create content scripts for major real estate websites
- Build UI components for analysis display
- Connect extension to backend API
- Implement user authentication flow

**Deliverables**: Working extension that can analyze properties on supported sites

### Sprint 3 (Weeks 5-6): User Portal & Enhanced Analysis

- Develop user portal with account management
- Implement subscription billing system
- Enhance analysis algorithms with improved accuracy
- Add comparative property and price history features
- Implement location-based amenities and risk analysis

**Deliverables**: User portal MVP and enhanced analysis features

### Sprint 4 (Weeks 7-8): Polish & Launch Preparation

- Add premium features and subscription tiers
- Implement caching and performance optimizations
- Complete end-to-end testing and bug fixes
- Prepare Chrome Web Store submission
- Finalize documentation and support materials

**Deliverables**: Launch-ready product with full feature set

## 8. Workstream Tickets

### EPIC: Backend Infrastructure

**HT-B1: Set up Node.js API project with TypeScript and Express**

- AC1: Project structure established with proper separation of concerns
- AC2: Environment configuration with dotenv set up
- AC3: Basic endpoint routing implemented

**HT-B2: Implement database setup and migration system**

- AC1: PostgreSQL connection configured with Prisma ORM
- AC2: Initial schema migration created
- AC3: User and analysis tables created with proper relations

**HT-B3: Set up OpenAI integration service**

- AC1: OpenAI client configured with API key management
- AC2: Prompt templates created for property analysis
- AC3: Response parsing and formatting implemented
- AC4: Error handling and retry logic implemented

**HT-B4: Create property data extraction and normalization service**

- AC1: Core data models implemented
- AC2: Input validation middleware created
- AC3: Data normalization functions for different listing formats

### EPIC: User Authentication & Management

**HT-U1: Implement Auth0 integration**

- AC1: Auth0 tenant configured
- AC2: JWT validation middleware created
- AC3: Token refresh flow implemented

**HT-U2: Create user management API endpoints**

- AC1: User registration endpoint created
- AC2: User profile management endpoints implemented
- AC3: User settings storage and retrieval endpoints implemented

**HT-U3: Implement subscription management**

- AC1: Subscription plans defined in database
- AC2: Stripe integration for payment processing
- AC3: Subscription status checking middleware created

### EPIC: Extension Development

**HT-E1: Set up Plasmo extension project**

- AC1: Project initialized with TypeScript configuration
- AC2: Manifest V3 configuration implemented
- AC3: Basic extension popup UI created

**HT-E2: Implement content scripts for property sites**

- AC1: Zillow data extraction implemented
- AC2: Redfin data extraction implemented
- AC3: Realtor.com data extraction implemented
- AC4: Trulia data extraction implemented

**HT-E3: Create extension UI components**

- AC1: Analysis results panel designed and implemented
- AC2: Fact check component with toggleable details created
- AC3: Photo analysis component with thumbnail previews created
- AC4: Price analysis component with chart visualization created

**HT-E4: Implement extension state management**

- AC1: Local storage service for persisting user preferences created
- AC2: Authentication state management implemented
- AC3: Analysis caching system implemented

### EPIC: Analysis Engine

**HT-A1: Implement fact-checking system**

- AC1: Claim extraction algorithm created
- AC2: Truth evaluation with confidence scoring implemented
- AC3: Explanation generation for each claim implemented

**HT-A2: Create photo analysis system**

- AC1: Image metadata extraction implemented
- AC2: Wide-angle lens detection algorithm created
- AC3: Virtual staging detection implemented
- AC4: Summary report generation implemented

**HT-A3: Implement price analysis system**

- AC1: Comparable properties finder algorithm created
- AC2: Price history tracking implemented
- AC3: Fair market value estimation algorithm created
- AC4: Price trend visualization created

**HT-A4: Create location analysis system**

- AC1: Nearby amenities detection implemented
- AC2: Transit and walk score calculation implemented
- AC3: Environmental risk assessment implemented
- AC4: Noise and pollution evaluation implemented

### EPIC: User Portal

**HT-P1: Set up Next.js portal project**

- AC1: Project initialized with TypeScript configuration
- AC2: Page routing structure implemented
- AC3: Authentication flow integrated with Auth0

**HT-P2: Implement account management features**

- AC1: User profile page created
- AC2: Settings configuration UI implemented
- AC3: Subscription management interface created

**HT-P3: Create analysis history dashboard**

- AC1: Analysis history list view implemented
- AC2: Analysis detail view with full report implemented
- AC3: Filtering and sorting functionality added

**HT-P4: Implement subscription and billing system**

- AC1: Plan selection UI created
- AC2: Payment processing flow implemented
- AC3: Billing history and receipt access implemented

## 9. Cursor Agent Prompts

````
### Cursor agent: Content Script Developer
Profile: Expert front-end engineer
Goal: Create content scripts that extract property data from major real estate websites

Tasks:
  1. Implement DOM parsing functions for Rightmove, Zoopla, OnTheMarket, and PrimeLocation
  2. Extract JSON-LD structured data from property listings
  3. Create button injection mechanism that follows UI guidelines
  4. Implement message passing to service worker
  5. Handle edge cases for different listing page layouts

Deliverables:
  * content-scripts/rightmove.ts
  * content-scripts/zoopla.ts
  * content-scripts/onthemarket.ts
  * content-scripts/primelocation.ts
  * components/HomeTruthButton.tsx
  * utils/extractors.ts

Acceptance criteria:
  - All extractors successfully parse property data from respective portals
  - Button appears in consistent position across all portals
  - Extracted data follows PropertyListing schema
  - Unit tests pass with >85% coverage
  - No runtime errors in Chrome DevTools console

Context:
```typescript
// Example JSON-LD from Rightmove
{
  "@context": "http://schema.org",
  "@type": "Product",
  "name": "3 bedroom semi-detached house for sale",
  "offers": {
    "@type": "Offer",
    "price": "325000",
    "priceCurrency": "GBP"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Willow Lane",
    "addressLocality": "Manchester",
    "postalCode": "M20 1LJ"
  }
}

// PropertyListing schema
interface PropertyListing {
  url: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  // ... other fields
}
```
````

````
### Cursor agent: UI Component Developer
Profile: Expert front-end engineer
Goal: Build extension UI components for analysis display

Tasks:
  1. Create main analysis modal component
  2. Implement fact check accordion component with expand/collapse
  3. Build image analysis carousel with overlay annotations
  4. Develop price analysis component with mini-chart
  5. Create feedback UI (thumbs up/down) with comment field

Deliverables:
  * components/AnalysisModal.tsx
  * components/FactCheckAccordion.tsx
  * components/ImageAnalysis.tsx
  * components/PriceAnalysis.tsx
  * components/FeedbackBar.tsx
  * styles/components.css

Acceptance criteria:
  - Components render correctly on all supported browsers
  - UI is responsive and adapts to different screen sizes
  - Animations are smooth and performant
  - Components match design specs in Figma
  - Accessibility standards are met (WCAG 2.1 AA)

Context:
```tsx
// Modal component example usage
<AnalysisModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  analysis={analysisResult}
  onFeedback={(type, comment) => handleFeedback(type, comment)}
/>

// Component theme constants
const COLORS = {
  primary: '#2563EB',
  secondary: '#4ADE80',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#FFFFFF',
  text: '#1F2937'
};
```
````

````
### Cursor agent: OpenAI Integration Engineer
Profile: Expert back-end engineer
Goal: Implement OpenAI function calling system for property analysis

Tasks:
  1. Design function schemas for different analysis types
  2. Create prompt engineering system for property analysis
  3. Implement chat completion API with streaming responses
  4. Build function router to handle different analysis requests
  5. Create response formatters for consistent output

Deliverables:
  * services/openai.ts
  * models/functions.ts
  * utils/prompts.ts
  * utils/streaming.ts
  * services/functionHandlers.ts

Acceptance criteria:
  - All function calls correctly extract and process listing data
  - Streaming responses work without interruption
  - Token usage is optimized and within budget
  - Error handling gracefully recovers from API issues
  - Response time remains under 3 seconds for 95% of requests

Context:
```typescript
// OpenAI function definition example
const propertyAnalysisFunctions = [
  {
    name: "analyzePropertyDescription",
    description: "Analyze property description for accuracy and potential issues",
    parameters: {
      type: "object",
      properties: {
        claims: {
          type: "array",
          items: {
            type: "object",
            properties: {
              statement: { type: "string" },
              assessment: { type: "string", enum: ["true", "misleading", "false", "unverifiable"] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              explanation: { type: "string" }
            },
            required: ["statement", "assessment", "confidence", "explanation"]
          }
        }
      },
      required: ["claims"]
    }
  }
];

// Environment variables
// OPENAI_API_KEY=sk-...
// OPENAI_MODEL=gpt-4
// MAX_TOKENS=1000
```
````

````
### Cursor agent: DevOps Engineer
Profile: Expert DevOps engineer
Goal: Set up CI/CD pipeline for extension and backend deployment

Tasks:
  1. Configure GitHub Actions workflows for testing and building
  2. Set up Plasmo build process for Chrome/Edge extension
  3. Create Docker container configuration for backend API
  4. Implement deployment scripts for Vercel and container registry
  5. Set up monitoring and alerting with Sentry

Deliverables:
  * .github/workflows/ci.yml
  * .github/workflows/release.yml
  * docker-compose.yml
  * api/Dockerfile
  * scripts/deploy.sh
  * sentry.config.ts

Acceptance criteria:
  - CI pipeline runs all tests on pull requests
  - Extension builds successfully for Chrome and Edge
  - Backend deploys automatically to staging on develop branch
  - Production deployments require manual approval
  - Error monitoring captures and groups issues correctly

Context:
```yaml
# Example GitHub Actions workflow
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      # Additional steps...
```
````

## 10. Glossary & Reference Links

| Term             | Definition                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Manifest V3      | Latest Chrome extension platform with enhanced security model and performance improvements |
| JSON-LD          | JavaScript Object Notation for Linked Data, format used for structured data in web pages   |
| Function Calling | OpenAI API feature that allows defining structured functions that the model can invoke     |
| Chrome Web Store | Google's distribution platform for Chrome extensions                                       |
| Plasmo           | Framework for building browser extensions with modern web technologies                     |
| Auth0            | Identity platform providing authentication and authorization services                      |
| Sentry           | Error monitoring and performance tracking service                                          |
| E2E Testing      | End-to-End testing that validates the complete application flow                            |
| GDPR             | General Data Protection Regulation, EU law on data protection and privacy                  |

### Reference Links

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Plasmo Framework](https://docs.plasmo.com/)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Next.js Documentation](https://nextjs.org/docs)
- [Auth0 Documentation](https://auth0.com/docs)
- [Sentry Documentation](https://docs.sentry.io/)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [Edge Add-ons Developer Dashboard](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview)
