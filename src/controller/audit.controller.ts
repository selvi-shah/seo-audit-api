import type { Request, Response } from "express";
import express from 'express';
import { AuditService } from "../service/audit.service.ts";
import { sendAuditReport } from "../service/email.service.ts";


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

    private auditUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const {url, email} = req.body;

        if(!url) {
            res.status(400).json({error: 'URL is required'});
            return;
        }

        const result = await this.auditService.auditUrl(url);

        console.log("Result:", result);
        console.log("Email:", email);

        if(email) {
            await sendAuditReport(email, result);
        }

        res.json({...result, emailSent: !!email});
        } catch (error) {
        console.error(error)
        res.status(500).json({error: "Audit failed"})
        }
    }
}

//  private auditUrl = async (
//         req: Request,
//         res: Response
//     ): Promise<void> => {
//         const { url } = req.body || {};
//         const result = await this.auditService.auditUrl(url);
//         res.json(result);
//     }