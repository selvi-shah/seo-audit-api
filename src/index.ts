import express from "express";
import { AuditController } from "./controller/audit.controller.ts";


const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true })); 

app.use('/auth', new AuditController().router);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});