import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { DecodedIdToken } from "firebase-admin/auth";
import { config } from "../config/env.ts";

if (config.nodeEnv !== 'production') {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
}

if (!getApps().length) {
    if (!config.firebaseProjectId || !config.firebaseClientEmail || !config.firebasePrivateKey) {
        throw new Error("Missing Firebase config in .env");
    }

    initializeApp({
        credential: cert({
            projectId:   config.firebaseProjectId,
            clientEmail: config.firebaseClientEmail,
            privateKey:  config.firebasePrivateKey.replace(/\\n/g, '\n'),
        }),
    });
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken> {
    try {
        return await getAuth().verifyIdToken(idToken);
    } catch (err) {
        console.error("[Firebase] verifyIdToken failed:", err);
        throw err;
    }
}