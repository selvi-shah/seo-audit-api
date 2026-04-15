import type { Request, Response } from "express";
import express from 'express';
import { AuditService } from "../service/audit.service.ts";

export class AuditController {
    public path = '/audit';
    public router = express.Router();
    private auditService = new AuditService();

    constructor() {
        this.initializeRoutes();

    }

    private initializeRoutes = (): void => {
        this.router
        .post(this.path,this.auditUrl)
    }

    private auditUrl = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const { url } = req.body || {};
        const result = await this.auditService.auditUrl(url);
        res.json(result);
    }
}