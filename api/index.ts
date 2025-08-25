import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import cors from "cors";
import { attachRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));

// Simple in-memory rate limiter (per IP): 60 requests / 1 minute
const windowMs = 60 * 1000;
const maxReq = 60;
const ipToHits: Record<string, { count: number; windowStart: number }> = {};
app.use((req, res, next) => {
  try {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const bucket = ipToHits[ip] || { count: 0, windowStart: now };
    if (now - bucket.windowStart > windowMs) {
      bucket.count = 0;
      bucket.windowStart = now;
    }
    bucket.count += 1;
    ipToHits[ip] = bucket;
    if (bucket.count > maxReq) {
      return res.status(429).json({ message: "Too Many Requests" });
    }
    next();
  } catch {
    next();
  }
});

attachRoutes(app);

export default function handler(req: VercelRequest, res: VercelResponse) {
  (app as any)(req, res);
}

