import type { Request, Response, NextFunction } from "express"
import { config } from "../config/env.ts";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: "No token provided"})
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token!, config.jwtSecret as string);
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or exprired token"})
    }
}