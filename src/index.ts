import { config } from './config/env.ts';  // ← first, no .ts extension

import express from "express";
import { AuditController } from "./controller/audit.controller.ts";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', new AuditController().router);  // ← /audit not /auth

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
