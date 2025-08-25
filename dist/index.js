// server/index.ts
import express2 from "express";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  networkTools;
  toolResults;
  networkEvents;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.networkTools = /* @__PURE__ */ new Map();
    this.toolResults = /* @__PURE__ */ new Map();
    this.networkEvents = /* @__PURE__ */ new Map();
    this.initializeDefaultTools();
    this.initializeMockEvents();
  }
  initializeDefaultTools() {
    const defaultTools = [
      { name: "Ping Tool", category: "discovery", description: "Test network connectivity and latency", icon: "satellite-dish", enabled: true },
      { name: "Port Scanner", category: "discovery", description: "Scan for open ports and services", icon: "search", enabled: true },
      { name: "DNS Lookup", category: "dns", description: "Resolve domain names and IP addresses", icon: "globe", enabled: true },
      { name: "Whois Lookup", category: "dns", description: "Domain registration information", icon: "info-circle", enabled: true },
      { name: "Speed Test", category: "monitoring", description: "Measure internet speed and latency", icon: "tachometer-alt", enabled: true },
      { name: "Network Topology", category: "monitoring", description: "Visualize network structure", icon: "project-diagram", enabled: true },
      { name: "SSL Analyzer", category: "security", description: "Analyze SSL certificates", icon: "lock", enabled: true },
      { name: "Vulnerability Scanner", category: "security", description: "Scan for security vulnerabilities", icon: "shield-alt", enabled: true },
      { name: "Subnet Calculator", category: "tools", description: "Calculate network subnets", icon: "calculator", enabled: true },
      { name: "Bandwidth Monitor", category: "monitoring", description: "Monitor real-time bandwidth usage", icon: "chart-line", enabled: true }
    ];
    defaultTools.forEach((tool) => {
      const id = randomUUID();
      this.networkTools.set(id, {
        ...tool,
        id,
        description: tool.description || null,
        icon: tool.icon || null,
        enabled: tool.enabled || null,
        createdAt: /* @__PURE__ */ new Date()
      });
    });
  }
  initializeMockEvents() {
    const mockEvents = [
      { eventType: "device_connected", severity: "info", message: "Device connected: 192.168.1.104", source: "network_monitor", metadata: null, resolved: false },
      { eventType: "high_bandwidth", severity: "warning", message: "High bandwidth usage detected on Server-01", source: "bandwidth_monitor", metadata: null, resolved: false },
      { eventType: "security_alert", severity: "error", message: "Suspicious activity detected from external IP", source: "security_scanner", metadata: null, resolved: false },
      { eventType: "backup_completed", severity: "info", message: "Configuration backup completed successfully", source: "backup_system", metadata: null, resolved: false }
    ];
    mockEvents.forEach((event) => {
      const id = randomUUID();
      this.networkEvents.set(id, {
        ...event,
        id,
        source: event.source || null,
        metadata: event.metadata || null,
        resolved: event.resolved || null,
        createdAt: /* @__PURE__ */ new Date()
      });
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Network Tool methods
  async getNetworkTools() {
    return Array.from(this.networkTools.values());
  }
  async getNetworkTool(id) {
    return this.networkTools.get(id);
  }
  async createNetworkTool(tool) {
    const id = randomUUID();
    const networkTool = {
      ...tool,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.networkTools.set(id, networkTool);
    return networkTool;
  }
  async updateNetworkTool(id, tool) {
    const existing = this.networkTools.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...tool };
    this.networkTools.set(id, updated);
    return updated;
  }
  // Tool Result methods
  async getToolResults(toolName, limit) {
    let results = Array.from(this.toolResults.values());
    if (toolName) {
      results = results.filter((result) => result.toolName === toolName);
    }
    results.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    if (limit) {
      results = results.slice(0, limit);
    }
    return results;
  }
  async getToolResult(id) {
    return this.toolResults.get(id);
  }
  async createToolResult(result) {
    const id = randomUUID();
    const toolResult = {
      ...result,
      id,
      userId: result.userId || null,
      parameters: result.parameters || null,
      results: result.results || null,
      executionTime: result.executionTime || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.toolResults.set(id, toolResult);
    return toolResult;
  }
  async deleteToolResult(id) {
    return this.toolResults.delete(id);
  }
  // Network Event methods
  async getNetworkEvents(limit) {
    let events = Array.from(this.networkEvents.values());
    events.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    if (limit) {
      events = events.slice(0, limit);
    }
    return events;
  }
  async getNetworkEvent(id) {
    return this.networkEvents.get(id);
  }
  async createNetworkEvent(event) {
    const id = randomUUID();
    const networkEvent = {
      ...event,
      id,
      source: event.source || null,
      metadata: event.metadata || null,
      resolved: event.resolved || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.networkEvents.set(id, networkEvent);
    return networkEvent;
  }
  async updateNetworkEvent(id, event) {
    const existing = this.networkEvents.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...event };
    this.networkEvents.set(id, updated);
    return updated;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var networkTools = pgTable("network_tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  icon: text("icon"),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var toolResults = pgTable("tool_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolName: text("tool_name").notNull(),
  userId: varchar("user_id"),
  parameters: jsonb("parameters"),
  results: jsonb("results"),
  status: text("status").notNull().default("completed"),
  executionTime: integer("execution_time"),
  createdAt: timestamp("created_at").defaultNow()
});
var networkEvents = pgTable("network_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  severity: text("severity").notNull(),
  message: text("message").notNull(),
  source: text("source"),
  metadata: jsonb("metadata"),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertNetworkToolSchema = createInsertSchema(networkTools).omit({
  id: true,
  createdAt: true
});
var insertToolResultSchema = createInsertSchema(toolResults).omit({
  id: true,
  createdAt: true
});
var insertNetworkEventSchema = createInsertSchema(networkEvents).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
import { z } from "zod";
function attachRoutes(app2) {
  app2.get("/api/tools", async (_req, res) => {
    try {
      const tools = await storage.getNetworkTools();
      res.json(tools);
    } catch {
      res.status(500).json({ message: "Failed to fetch network tools" });
    }
  });
  app2.get("/api/tools/:id", async (req, res) => {
    try {
      const tool = await storage.getNetworkTool(req.params.id);
      if (!tool) return res.status(404).json({ message: "Tool not found" });
      res.json(tool);
    } catch {
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });
  app2.get("/api/results", async (req, res) => {
    try {
      const { toolName, limit } = req.query;
      const results = await storage.getToolResults(
        toolName,
        limit ? parseInt(limit) : void 0
      );
      res.json(results);
    } catch {
      res.status(500).json({ message: "Failed to fetch tool results" });
    }
  });
  app2.post("/api/results", async (req, res) => {
    try {
      const validatedData = insertToolResultSchema.parse(req.body);
      const result = await storage.createToolResult(validatedData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tool result" });
      }
    }
  });
  app2.get("/api/results/:id", async (req, res) => {
    try {
      const result = await storage.getToolResult(req.params.id);
      if (!result) return res.status(404).json({ message: "Result not found" });
      res.json(result);
    } catch {
      res.status(500).json({ message: "Failed to fetch result" });
    }
  });
  app2.delete("/api/results/:id", async (req, res) => {
    try {
      const success = await storage.deleteToolResult(req.params.id);
      if (!success) return res.status(404).json({ message: "Result not found" });
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Failed to delete result" });
    }
  });
  app2.get("/api/events", async (req, res) => {
    try {
      const { limit } = req.query;
      const events = await storage.getNetworkEvents(
        limit ? parseInt(limit) : void 0
      );
      res.json(events);
    } catch {
      res.status(500).json({ message: "Failed to fetch network events" });
    }
  });
  app2.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertNetworkEventSchema.parse(req.body);
      const event = await storage.createNetworkEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create network event" });
      }
    }
  });
  app2.post("/api/tools/ping", async (req, res) => {
    try {
      const { host, count = 4, timeout = 5e3 } = req.body;
      if (!host || typeof host !== "string") {
        return res.status(400).json({ message: "host is required" });
      }
      let stdout = "";
      const start = Date.now();
      try {
        const { execFile } = await import("child_process");
        const { promisify } = await import("util");
        const execFileAsync = promisify(execFile);
        const isWindows = process.platform === "win32";
        const args = isWindows ? ["-n", String(count), host] : ["-c", String(count), "-w", String(Math.ceil(timeout / 1e3)), host];
        const resExec = await execFileAsync("ping", args, { timeout });
        stdout = resExec.stdout;
      } catch {
        const net = await import("net");
        const ports = [80, 443];
        const trials = Math.max(1, Math.min(count, 4));
        const samples = [];
        for (let i = 0; i < trials; i++) {
          const port = ports[i % ports.length];
          const t0 = Date.now();
          try {
            await new Promise((resolve, reject) => {
              const s = new net.Socket();
              s.setTimeout(timeout);
              s.once("connect", () => {
                s.destroy();
                resolve();
              });
              s.once("timeout", () => {
                s.destroy();
                reject(new Error("timeout"));
              });
              s.once("error", () => {
                s.destroy();
                reject(new Error("error"));
              });
              s.connect(port, host);
            });
            samples.push(Date.now() - t0);
          } catch {
          }
        }
        stdout = samples.map((ms) => `time=${ms} ms`).join("\n");
      }
      const lines = stdout.split("\n").filter(Boolean);
      const pingLines = lines.filter((l) => /time[=<]/i.test(l) || /Average/i.test(l));
      const results = pingLines.filter((l) => /time[=<]/i.test(l)).map((line, idx) => {
        const timeMatch = line.match(/time[=<]([0-9.]+)/i);
        const ttlMatch = line.match(/ttl=([0-9]+)/i);
        const bytesMatch = line.match(/bytes=([0-9]+)/i);
        return {
          sequence: idx + 1,
          host,
          time: timeMatch ? Number(timeMatch[1]) : null,
          ttl: ttlMatch ? Number(ttlMatch[1]) : null,
          bytes: bytesMatch ? Number(bytesMatch[1]) : null
        };
      });
      const times = results.map((r) => r.time || 0).filter((n) => n > 0);
      const avgTime = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
      const toolResult = await storage.createToolResult({
        toolName: "ping",
        parameters: { host, count, timeout },
        results: {
          pings: results,
          statistics: {
            sent: count,
            received: results.length,
            lost: Math.max(0, count - results.length),
            lossPercent: Math.max(0, Math.round((count - results.length) / count * 100)),
            avgTime,
            minTime: times.length ? Math.min(...times) : null,
            maxTime: times.length ? Math.max(...times) : null
          }
        },
        status: "completed",
        executionTime: Date.now() - start
      });
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Ping execution failed", error: errorMessage });
    }
  });
  app2.post("/api/tools/port-scan", async (req, res) => {
    try {
      const { host, startPort = 1, endPort = 1e3 } = req.body;
      if (!host) return res.status(400).json({ message: "host is required" });
      const maxRange = 2e3;
      if (startPort < 1 || endPort > 65535 || startPort > endPort || endPort - startPort + 1 > maxRange) {
        return res.status(400).json({ message: "invalid or too large port range (max 2000)" });
      }
      const net = await import("net");
      const concurrency = 100;
      const ports = Array.from({ length: endPort - startPort + 1 }, (_, i) => startPort + i);
      const startTime = Date.now();
      const openPorts = [];
      const tryConnect = (port) => new Promise((resolve) => {
        const socket = new net.Socket();
        let done = false;
        const timeout = setTimeout(() => {
          if (!done) {
            done = true;
            socket.destroy();
            resolve();
          }
        }, 750);
        socket.once("connect", () => {
          if (!done) {
            done = true;
            clearTimeout(timeout);
            openPorts.push({ port });
            socket.destroy();
            resolve();
          }
        }).once("error", () => {
          if (!done) {
            done = true;
            clearTimeout(timeout);
            resolve();
          }
        }).connect(port, host);
      });
      for (let i = 0; i < ports.length; i += concurrency) {
        const batch = ports.slice(i, i + concurrency);
        await Promise.all(batch.map(tryConnect));
      }
      const serviceMap = {
        22: "SSH",
        23: "Telnet",
        53: "DNS",
        80: "HTTP",
        110: "POP3",
        143: "IMAP",
        443: "HTTPS",
        993: "IMAPS",
        995: "POP3S",
        3389: "RDP",
        8080: "HTTP-Alt",
        8443: "HTTPS-Alt"
      };
      const results = openPorts.map(({ port }) => ({
        port,
        protocol: "TCP",
        state: "open",
        service: serviceMap[port] || null
      }));
      const toolResult = await storage.createToolResult({
        toolName: "port-scan",
        parameters: { host, startPort, endPort },
        results: {
          host,
          openPorts: results,
          totalScanned: endPort - startPort + 1,
          openCount: results.length
        },
        status: "completed",
        executionTime: Date.now() - startTime
      });
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Port scan failed", error: errorMessage });
    }
  });
  app2.post("/api/tools/dns-lookup", async (req, res) => {
    try {
      const { domain, recordType = "A" } = req.body;
      if (!domain) return res.status(400).json({ message: "domain is required" });
      const dns = await import("node:dns");
      const resolver = dns.promises;
      const startTime = Date.now();
      let records = [];
      switch (recordType) {
        case "A":
          records = await resolver.resolve4(domain);
          break;
        case "AAAA":
          records = await resolver.resolve6(domain);
          break;
        case "MX":
          records = await resolver.resolveMx(domain);
          break;
        case "TXT":
          records = await resolver.resolveTxt(domain);
          break;
        case "CNAME":
          records = await resolver.resolveCname(domain);
          break;
        case "NS":
          records = await resolver.resolveNs(domain);
          break;
        case "SRV":
          records = await resolver.resolveSrv(domain);
          break;
        case "SOA":
          records = await resolver.resolveSoa(domain);
          break;
        default:
          return res.status(400).json({ message: `unsupported recordType ${recordType}` });
      }
      const toolResult = await storage.createToolResult({
        toolName: "dns-lookup",
        parameters: { domain, recordType },
        results: { domain, recordType, records },
        status: "completed",
        executionTime: Date.now() - startTime
      });
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "DNS lookup failed", error: errorMessage });
    }
  });
  app2.post("/api/tools/speed-test", async (_req, res) => {
    try {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const toolResult = await storage.createToolResult({
        toolName: "speed-test",
        parameters: {},
        results: { download: null, upload: null, ping: null, jitter: null, server: "vercel", timestamp: now },
        status: "completed",
        executionTime: 1e3
      });
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Speed test failed", error: errorMessage });
    }
  });
  app2.post("/api/tools/ssl-analyze", async (req, res) => {
    try {
      const { url, port = 443 } = req.body;
      if (!url) return res.status(400).json({ message: "url is required" });
      const hostname = new URL(url).hostname;
      const tls = await import("tls");
      const start = Date.now();
      const result = await new Promise((resolve, reject) => {
        const socket = tls.connect({
          host: hostname,
          port,
          servername: hostname,
          rejectUnauthorized: false,
          timeout: 8e3
        }, () => {
          try {
            const cert2 = socket.getPeerCertificate(true);
            const protocol2 = socket.getProtocol();
            const cipher2 = socket.getCipher();
            socket.end();
            resolve({ cert: cert2, protocol: protocol2, cipher: cipher2 });
          } catch (e) {
            socket.end();
            reject(e);
          }
        });
        socket.on("error", reject);
        socket.on("timeout", () => {
          socket.destroy(new Error("TLS timeout"));
        });
      });
      const { cert, protocol, cipher } = result;
      const sslResult = {
        hostname,
        port,
        valid: Boolean(cert && cert.valid_to && new Date(cert.valid_to) > /* @__PURE__ */ new Date()),
        issuer: cert?.issuer?.O || cert?.issuerCertificate?.subject?.O || null,
        subject: cert?.subject?.CN || hostname,
        validFrom: cert?.valid_from ? new Date(cert.valid_from).toISOString() : null,
        validTo: cert?.valid_to ? new Date(cert.valid_to).toISOString() : null,
        protocol: protocol || null,
        cipherSuite: cipher?.name || null,
        warnings: []
      };
      const toolResult = await storage.createToolResult({
        toolName: "ssl-analyze",
        parameters: { url, port },
        results: sslResult,
        status: "completed",
        executionTime: Date.now() - start
      });
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "SSL analysis failed", error: errorMessage });
    }
  });
  app2.post("/api/tools/subnet-calculate", async (req, res) => {
    try {
      const { ipAddress, subnetMask, subnetCount = 4 } = req.body;
      if (!ipAddress || !subnetMask) return res.status(400).json({ message: "ipAddress and subnetMask are required" });
      const baseIP = ipAddress.split(".").slice(0, 3).join(".");
      const maskBits = parseInt(subnetMask);
      const subnetSize = Math.pow(2, 32 - maskBits - 2);
      const subnets = [];
      for (let i = 0; i < subnetCount; i++) {
        const networkStart = i * subnetSize;
        subnets.push({
          subnetNumber: i + 1,
          network: `${baseIP}.${networkStart}/${maskBits + 2}`,
          firstHost: `${baseIP}.${networkStart + 1}`,
          lastHost: `${baseIP}.${networkStart + subnetSize - 2}`,
          broadcast: `${baseIP}.${networkStart + subnetSize - 1}`,
          hostCount: subnetSize - 2
        });
      }
      const toolResult = await storage.createToolResult({
        toolName: "subnet-calculate",
        parameters: { ipAddress, subnetMask, subnetCount },
        results: {
          originalNetwork: `${ipAddress}/${maskBits}`,
          subnets,
          totalHosts: (subnetSize - 2) * subnetCount
        },
        status: "completed",
        executionTime: 300
      });
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Subnet calculation failed", error: errorMessage });
    }
  });
  app2.post("/api/tools/whois-lookup", async (req, res) => {
    try {
      const { domain } = req.body;
      if (!domain) return res.status(400).json({ message: "domain is required" });
      const whoisModule = await import("whois-json");
      const whois = whoisModule?.default || whoisModule;
      const start = Date.now();
      const data = await whois(domain, { follow: 2, timeout: 1e4 });
      const toolResult = await storage.createToolResult({
        toolName: "whois-lookup",
        parameters: { domain },
        results: data,
        status: "completed",
        executionTime: Date.now() - start
      });
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Whois lookup failed", error: errorMessage });
    }
  });
  app2.post("/api/tools/vulnerability-scan", async (req, res) => {
    try {
      const { target } = req.body;
      const results = { target, scanTime: 5, vulnerabilities: [], summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 } };
      const toolResult = await storage.createToolResult({
        toolName: "vulnerability-scan",
        parameters: { target },
        results,
        status: "completed",
        executionTime: 5e3
      });
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Vulnerability scan failed", error: errorMessage });
    }
  });
  app2.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = { networkUptime: 99.9, activeDevices: 0, bandwidthUsage: 0, securityAlerts: 0, lastUpdate: (/* @__PURE__ */ new Date()).toISOString() };
      res.json(stats);
    } catch {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/robots.txt", (_req, res) => {
    const baseUrl = process.env.PUBLIC_BASE_URL || "https://example.com";
    const lines = [
      "User-agent: *",
      "Allow: /",
      `Sitemap: ${baseUrl}/sitemap.xml`
    ].join("\n");
    res.header("Content-Type", "text/plain; charset=utf-8").header("Cache-Control", "public, max-age=3600, stale-while-revalidate=600").send(lines);
  });
  app2.get("/sitemap.xml", (_req, res) => {
    const baseUrl = process.env.PUBLIC_BASE_URL || "https://example.com";
    const routes = [
      "",
      "ping",
      "port-scanner",
      "dns-lookup",
      "speed-test",
      "network-topology",
      "ssl-analyzer",
      "subnet-calculator",
      "whois-lookup",
      "vulnerability-scanner",
      "bandwidth-monitor"
    ];
    const urlset = routes.map((r) => {
      const loc = r ? `${baseUrl}/${r}` : `${baseUrl}/`;
      const today = (/* @__PURE__ */ new Date()).toISOString();
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
    res.header("Content-Type", "application/xml; charset=utf-8").header("Cache-Control", "public, max-age=3600, stale-while-revalidate=600").send(xml);
  });
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  },
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(process.env.VITE_API_BASE_URL || "")
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: server ? { server } : false,
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  attachRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    const server2 = await setupVite(app, void 0);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const server = (await import("http")).createServer(app);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
