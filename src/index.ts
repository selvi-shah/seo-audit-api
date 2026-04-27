import { config } from './config/env.ts';  // ← first, no .ts extension

import express from "express";
import { AuditController } from "./controller/audit.controller.ts";
import { AuthController } from './controller/auth.controller.ts';
import { authMiddleware } from './middleware/auth.middleware.ts';

import cors from 'cors';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', new AuthController().router);                   // auth routes, no middleware
app.use('/audit', authMiddleware, new AuditController().router);


app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
