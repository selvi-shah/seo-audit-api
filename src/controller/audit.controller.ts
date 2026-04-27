import type { Request, Response } from "express";
import express from 'express';
import { AuditService } from "../service/audit.service.ts";
import { sendAuditReport, sendComparisonReport } from "../service/email.service.ts";
import { compareCompetitors } from "../helpers/competitor.diff.ts";



export class AuditController {
    public path = '/audit';
    public router = express.Router();
    private auditService = new AuditService();

    constructor() {
        this.initializeRoutes();

    }

    private initializeRoutes = (): void => {
        this.router
        .post('/', this.auditUrl)
        .post(`/compare`, this.compareCompetitors);
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
        } catch (error: any) {
        console.error(error)
        res.status(500).json({error: error.message || "Audit failed"})
        }
    }


    private compareCompetitors = async (req: Request, res: Response): Promise<void> => {
        try {
            const { urlA, urlB, email} = req.body;

            if(!urlA || !urlB) {
                res.status(400).json({ error: "UrlA and UrlB are required"});
                return;
            }

            console.log("Auditing both Urls");
                const[auditA, auditB] = await Promise.all([
                    this.auditService.auditUrl(urlA),
                    this.auditService.auditUrl(urlB),
                ]);

            const comparison = compareCompetitors(urlA, auditA, urlB, auditB);

            if(email) {
                await sendComparisonReport(email, comparison);
            }

            res.json({
                success: true,
                ...comparison
            });
        } catch (error) {
            res.status(500).json({ error: "Comparsion failed"});
        }
    }

}
