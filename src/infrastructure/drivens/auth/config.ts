import env from "env-var";

export const authConfig = {
  secret: env.get("JWT_SECRET").required().asString(),
  accessExpirySeconds: env.get("JWT_ACCESS_EXPIRY_SECONDS").default(900).asIntPositive(),
  refreshExpirySeconds: env.get("JWT_REFRESH_EXPIRY_SECONDS").default(604800).asIntPositive(),
};
