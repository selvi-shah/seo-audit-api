import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: envFile });

export const config = {
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  groqApiKey: process.env.GROQ_API_KEY,
  gmailUser: process.env.GMAIL_USER || '',
  gmailPass: process.env.GMAIL_APP_PASSWORD || '',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key' as string,
  firebaseProjectId:   process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey:  process.env.FIREBASE_PRIVATE_KEY,
  port: process.env.PORT || 3000,  // ← add this

};