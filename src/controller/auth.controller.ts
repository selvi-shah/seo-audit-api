import express from "express";
import type { Request, Response } from "express";
import { AuthService } from "../service/auth.service.ts";

export class AuthController {
    public router = express.Router();
    private authService = new AuthService();

    constructor() {
        this.intializeRoutes();
    }

    private intializeRoutes = (): void => {
        this.router
        .post('/register', this.register)
        .post('/login', this.login);
    }

    private register = async (req: Request, res: Response): Promise<void> => {
        try {
            const {email, password} = req.body;

            if(!email || !password) {
                res.status(400).json({ error: "Email and password are required"});
                return;
            }

            const result = await this.authService.register(email, password);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({error: error.message})
        }
    }

    private login = async (req: Request, res: Response): Promise<void> => {
        try {
            const {email, password} = req.body;

            if(!email || !password) {
                res.status(400).json({ error: "Email and password are required"});
                return;
            }

            const result = await this.authService.login(email, password);
            res.status(200).json(result);
            
        } catch (error: any) {
            res.status(401).json({ error: error.message});
        }
    }
}