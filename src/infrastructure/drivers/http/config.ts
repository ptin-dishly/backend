import env from "env-var";

export const httpConfig = {
  port: env.get("PORT").default(3000).asPortNumber(),
  isDev: env.get("NODE_ENV").default("development").asString() !== "production",

  timeouts: {
    headersTimeout: env.get("HTTP_HEADERS_TIMEOUT").default(10000).asIntPositive(),
    requestTimeout: env.get("HTTP_REQUEST_TIMEOUT").default(30000).asIntPositive(),
    keepAliveTimeout: env.get("HTTP_KEEP_ALIVE_TIMEOUT").default(5000).asIntPositive(),
  },

  limits: {
    jsonLimit: env.get("HTTP_JSON_LIMIT").default("1mb").asString(),
    urlencodedLimit: env.get("HTTP_URLENCODED_LIMIT").default("1mb").asString(),
    parameterLimit: env.get("HTTP_PARAMETER_LIMIT").default(100).asIntPositive(),
  },

  cors: {
    origin: env.get("CORS_ORIGIN").default("*").asString(),
    credentials: env.get("CORS_CREDENTIALS").default("false").asBool(),
  },

  compression: {
    level: env.get("COMPRESSION_LEVEL").default(6).asIntPositive(),
    threshold: env.get("COMPRESSION_THRESHOLD").default(1024).asIntPositive(),
  },
};
