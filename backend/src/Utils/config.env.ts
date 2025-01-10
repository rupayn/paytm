export const confEnv = {
  PORT: process.env.PORT ?? 8000,
  MONGOOSE_URL: process.env.MONGOOSE_URL ?? "mongodb://127.0.0.1:27017/paytm",
  SLT: process.env.SLT??8,
  CORS_ORIGIN: process.env.CORS_ORIGIN??'*',
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET??"werefddgrhuy",
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET??"ghjuytfghe",
};