/**
 * OpenAI configuration
 */
const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY || "",
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  temperature: +(process.env.OPENAI_TEMPERATURE || 0.2),
  qpmLimit: +(process.env.OPENAI_QPM_LIMIT || 60),
  cacheTtlSeconds: +(process.env.CACHE_TTL_SECONDS || 86400),
};

module.exports = openaiConfig;
