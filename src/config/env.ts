import dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "local"}`;

dotenv.config({ path: envFile });

export const config = {
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  groqApiKey: process.env.GROQ_API_KEY,
};