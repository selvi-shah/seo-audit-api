import express from "express";
import type { Request, Response } from "express";
import { AuthService } from "../service/auth.service.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

export class AuthController {
    public router = express.Router();
    private authService = new AuthService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes = (): void => {
        this.router
            .post('/register',    this.register)    // Step 1a: email + password + phone
            .post('/login',       this.login)       // Step 1b: email + password → tempToken
            .post('/verify-otp',  this.verifyOtp)   // Step 2:  tempToken + Firebase OTP → JWT
            .post('/refresh',     this.refresh)     // Refresh access token
            .post('/logout',      this.logout)      // Revoke refresh token
            .get('/me',           authMiddleware, this.me);  // Get current user
    }

    // ── Register ───────────────────────────────────────────────────────────
    private register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password, phone } = req.body;

            if (!email || !password || !phone) {
                res.status(400).json({
                    error: "Email, password and phone are required"
                });
                return;
            }

            const result = await this.authService.register(email, password, phone);
            res.status(201).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // ── Login (password check → tempToken) ────────────────────────────────
    private login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    error: "Email and password are required"
                });
                return;
            }

            const result = await this.authService.login(email, password);
            res.status(200).json(result);

        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }

    // ── Verify OTP (tempToken + Firebase idToken → final JWT) ──────────────
    private verifyOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { tempToken, firebaseIdToken } = req.body;

            if (!tempToken || !firebaseIdToken) {
                res.status(400).json({
                    error: "tempToken and firebaseIdToken are required"
                });
                return;
            }

            const ipAddress = req.ip ?? null;
            const userAgent = req.headers['user-agent'] ?? null;

            const tokens = await this.authService.verifyOtp(
                tempToken,
                firebaseIdToken,
                ipAddress,
                userAgent
            );

            res.status(200).json(tokens);

        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }

    // ── Refresh ────────────────────────────────────────────────────────────
    private refresh = async (req: Request, res: Response): Promise<void> => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({ error: "refreshToken is required" });
                return;
            }

            const result = await this.authService.refresh(refreshToken);
            res.status(200).json(result);

        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }

    // ── Logout ─────────────────────────────────────────────────────────────
    private logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({ error: "refreshToken is required" });
                return;
            }

            // Get userId from JWT in Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                res.status(401).json({ error: "Missing Authorization header" });
                return;
            }

            const jwt = await import("jsonwebtoken");
            const payload: any = jwt.default.verify(
                authHeader.slice(7),
                process.env.JWT_SECRET as string
            );

            await this.authService.logout(refreshToken, payload.userId);
            res.status(200).json({ success: true });

        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }

    // ── Me ─────────────────────────────────────────────────────────────────
    private me = async (req: Request, res: Response): Promise<void> => {
        try {
            // req.user is set by requireAuth middleware
            if (!req.user) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            res.status(200).json({ user: req.user });

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}