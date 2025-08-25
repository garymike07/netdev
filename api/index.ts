import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import cors from "cors";
import { attachRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));

attachRoutes(app);

export default function handler(req: VercelRequest, res: VercelResponse) {
  (app as any)(req, res);
}

