import pg from "pg";
import env from "env-var";

const dbConfig = {
  host: env.get("DB_HOST").default("localhost").asString(),
  port: env.get("DB_PORT").default(5432).asPortNumber(),
  database: env.get("DB_NAME").required().asString(),
  user: env.get("DB_USER").required().asString(),
  password: env.get("DB_PASSWORD").required().asString(),
  max: env.get("DB_POOL_MAX").default(20).asIntPositive(),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
};

export const pool = new pg.Pool(dbConfig);
