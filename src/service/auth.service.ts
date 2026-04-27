import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/env.ts";
import {
    createUser,
    findUserByEmail,
    findUserById,
    updateFirebaseUid,
    saveRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
} from "../db/user.repo.ts";
import { verifyFirebaseToken } from "./firebase.service.ts";
import type { AuthTokens, JwtPayload } from "../types/auth.ts";

const ACCESS_EXPIRY_SEC  = 15 * 60;           // 15 minutes
const REFRESH_EXPIRY_SEC = 30 * 24 * 60 * 60; // 30 days
const TEMP_EXPIRY_SEC    = 5 * 60;            // 5 minutes (between password + OTP)

export class AuthService {

    // ── Step 1a: Register (email + password + phone) ───────────────────────
    async register(email: string, password: string, phone: string) {
        const existing = await findUserByEmail(email);
        if (existing) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(email, hashedPassword, phone);

        return {
            message: "User registered successfully. Please log in.",
            userId: user.id,
        };
    }

    // ── Step 1b: Login (email + password) → tempToken ─────────────────────
    // tempToken is short-lived (5 min), only used to proceed to OTP step
    async login(email: string, password: string) {
        const user = await findUserByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        if (!user.is_active) {
            throw new Error("Account suspended. Contact support.");
        }

        const isValid = await bcrypt.compare(password, user.password as string);
        if (!isValid) {
            throw new Error("Invalid credentials");
        }

        // Issue a short-lived temp token — NOT the final access token
        const tempToken = jwt.sign(
            { userId: user.id, phone: user.phone, step: 'otp_pending' },
            config.jwtSecret as string,
            { expiresIn: '5m' }
        );

        return {
            tempToken,
            expiresIn: TEMP_EXPIRY_SEC,
            phone: this.maskPhone(user.phone),
            rawPhone: user.phone,
            message: "Password verified. Please complete OTP verification.",
        };
    }

    // ── Step 2: Verify OTP (tempToken + Firebase idToken) → final JWT ─────
    async verifyOtp(tempToken: string, firebaseIdToken: string, ipAddress: string | null, userAgent: string | null): Promise<AuthTokens> {

        // 1. Verify tempToken is valid and not expired
        let tempPayload: any;
        try {
            tempPayload = jwt.verify(tempToken, config.jwtSecret as string);
        } catch (err) {
            throw new Error("Session expired. Please log in again.");
        }

        if (tempPayload.step !== 'otp_pending') {
            throw new Error("Invalid token. Please log in again.");
        }

        // 2. Verify Firebase OTP token
        let decoded: any;
        try {
            decoded = await verifyFirebaseToken(firebaseIdToken);
        } catch (err) {
            throw new Error("Invalid or expired OTP. Please try again.");
        }

        // 3. Make sure Firebase phone matches the user's registered phone
        const user = await findUserById(tempPayload.userId);
        if (!user) {
            throw new Error("User not found.");
        }

        const firebasePhone = decoded.phone_number?.replace(/\s/g, '');
        const userPhone     = user.phone?.replace(/\s/g, '');

        if (firebasePhone !== userPhone) {
            throw new Error("Phone number does not match your account.");
        }

        // 4. Save Firebase UID on first OTP verification
        if (!user.firebase_uid) {
            await updateFirebaseUid(user.id as unknown as number, decoded.uid);
        }

        // 5. Issue final access + refresh tokens
        const accessToken = jwt.sign(
            { userId: user.id, phone: user.phone, role: user.role } as JwtPayload,
            config.jwtSecret as string,
            { expiresIn: '15m' }
        );

        const rawRefresh  = crypto.randomBytes(40).toString('hex');
        const refreshHash = crypto.createHash('sha256').update(rawRefresh).digest('hex');
        const expiresAt   = new Date(Date.now() + REFRESH_EXPIRY_SEC * 1000);

        await saveRefreshToken(
            user.id as unknown as number,
            refreshHash,
            expiresAt,
            ipAddress,
            userAgent
        );

        return {
            accessToken,
            refreshToken: rawRefresh,
            expiresIn: ACCESS_EXPIRY_SEC,
        };
    }

    // ── Refresh access token ───────────────────────────────────────────────
    async refresh(rawRefreshToken: string) {
        const hash   = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
        const record = await findRefreshToken(hash);

        if (!record) {
            throw new Error("Invalid or expired refresh token.");
        }

        if (!record.is_active) {
            throw new Error("Account suspended.");
        }

        const accessToken = jwt.sign(
            { userId: record.user_id, phone: record.phone, role: record.role } as JwtPayload,
            config.jwtSecret as string,
            { expiresIn: '15m' }
        );

        return { accessToken, expiresIn: ACCESS_EXPIRY_SEC };
    }

    // ── Logout ─────────────────────────────────────────────────────────────
    async logout(rawRefreshToken: string, userId: number) {
        const hash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
        await revokeRefreshToken(hash, userId);
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private maskPhone(phone: string): string {
        // +919876543210 → +91•••••3210
        return phone.slice(0, 3) + '•'.repeat(Math.max(0, phone.length - 7)) + phone.slice(-4);
    }
}