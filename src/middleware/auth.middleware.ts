import type { Request, Response, NextFunction } from "express";
import { config } from "../config/env.ts";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.ts";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: "No token provided" });
            return;
        }

        const token   = authHeader.split(' ')[1];
        const decoded = jwt.verify(token!, config.jwtSecret as string) as JwtPayload;

        // Now properly typed — no more (req as any)
        req.user = {
            id:    String(decoded.userId),
            phone: decoded.phone,
            role:  decoded.role,
        };

        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};