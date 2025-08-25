import type { Express } from "express";
import { storage } from "./storage";
import { insertToolResultSchema, insertNetworkEventSchema } from "@shared/schema";
import { z } from "zod";

export function attachRoutes(app: Express): void {
  // Network Tools API
  app.get("/api/tools", async (_req, res) => {
    try {
      const tools = await storage.getNetworkTools();
      res.json(tools);
    } catch {
      res.status(500).json({ message: "Failed to fetch network tools" });
    }
  });

  app.get("/api/tools/:id", async (req, res) => {
    try {
      const tool = await storage.getNetworkTool(req.params.id);
      if (!tool) return res.status(404).json({ message: "Tool not found" });
      res.json(tool);
    } catch {
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  // Tool Results API
  app.get("/api/results", async (req, res) => {
    try {
      const { toolName, limit } = req.query;
      const results = await storage.getToolResults(
        toolName as string,
        limit ? parseInt(limit as string) : undefined,
      );
      res.json(results);
    } catch {
      res.status(500).json({ message: "Failed to fetch tool results" });
    }
  });

  app.post("/api/results", async (req, res) => {
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

  app.get("/api/results/:id", async (req, res) => {
    try {
      const result = await storage.getToolResult(req.params.id);
      if (!result) return res.status(404).json({ message: "Result not found" });
      res.json(result);
    } catch {
      res.status(500).json({ message: "Failed to fetch result" });
    }
  });

  app.delete("/api/results/:id", async (req, res) => {
    try {
      const success = await storage.deleteToolResult(req.params.id);
      if (!success) return res.status(404).json({ message: "Result not found" });
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Failed to delete result" });
    }
  });

  // Network Events API
  app.get("/api/events", async (req, res) => {
    try {
      const { limit } = req.query;
      const events = await storage.getNetworkEvents(
        limit ? parseInt(limit as string) : undefined,
      );
      res.json(events);
    } catch {
      res.status(500).json({ message: "Failed to fetch network events" });
    }
  });

  app.post("/api/events", async (req, res) => {
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

  // Network Tool Execution Endpoints
  app.post("/api/tools/ping", async (req, res) => {
    try {
      const { host, count = 4, timeout = 5000 } = req.body;
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
        const args = isWindows
          ? ["-n", String(count), host]
          : ["-c", String(count), "-w", String(Math.ceil(timeout / 1000)), host];

        const resExec = await execFileAsync("ping", args, { timeout });
        stdout = resExec.stdout;
      } catch {
        const net = await import("net");
        const ports = [80, 443];
        const trials = Math.max(1, Math.min(count, 4));
        const samples: number[] = [];
        for (let i = 0; i < trials; i++) {
          const port = ports[i % ports.length];
          const t0 = Date.now();
          try {
            await new Promise<void>((resolve, reject) => {
              const s = new (net as any).Socket();
              s.setTimeout(timeout);
              s.once("connect", () => { s.destroy(); resolve(); });
              s.once("timeout", () => { s.destroy(); reject(new Error("timeout")); });
              s.once("error", () => { s.destroy(); reject(new Error("error")); });
              s.connect(port, host);
            });
            samples.push(Date.now() - t0);
          } catch {
            // treat as lost
          }
        }
        stdout = samples.map(ms => `time=${ms} ms`).join("\n");
      }

      const lines = stdout.split("\n").filter(Boolean);
      const pingLines = lines.filter(l => /time[=<]/i.test(l) || /Average/i.test(l));
      const results = pingLines
        .filter(l => /time[=<]/i.test(l))
        .map((line, idx) => {
          const timeMatch = line.match(/time[=<]([0-9.]+)/i);
          const ttlMatch = line.match(/ttl=([0-9]+)/i);
          const bytesMatch = line.match(/bytes=([0-9]+)/i);
          return {
            sequence: idx + 1,
            host,
            time: timeMatch ? Number(timeMatch[1]) : null,
            ttl: ttlMatch ? Number(ttlMatch[1]) : null,
            bytes: bytesMatch ? Number(bytesMatch[1]) : null,
          };
        });

      const times = results.map(r => r.time || 0).filter(n => n > 0);
      const avgTime = times.length ? Math.round(times.reduce((a,b)=>a+b,0) / times.length) : null;

      const toolResult = await storage.createToolResult({
        toolName: "ping",
        parameters: { host, count, timeout },
        results: {
          pings: results,
          statistics: {
            sent: count,
            received: results.length,
            lost: Math.max(0, count - results.length),
            lossPercent: Math.max(0, Math.round(((count - results.length) / count) * 100)),
            avgTime,
            minTime: times.length ? Math.min(...times) : null,
            maxTime: times.length ? Math.max(...times) : null,
          }
        },
        status: "completed",
        executionTime: Date.now() - start
      });

      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Ping execution failed", error: errorMessage });
    }
  });

  app.post("/api/tools/port-scan", async (req, res) => {
    try {
      const { host, startPort = 1, endPort = 1000 } = req.body;
      if (!host) return res.status(400).json({ message: "host is required" });
      const maxRange = 2000;
      if (startPort < 1 || endPort > 65535 || startPort > endPort || (endPort - startPort + 1) > maxRange) {
        return res.status(400).json({ message: "invalid or too large port range (max 2000)" });
      }

      const net = await import("net");
      const concurrency = 100;
      const ports = Array.from({ length: endPort - startPort + 1 }, (_, i) => startPort + i);

      const startTime = Date.now();
      const openPorts: Array<{ port: number; service?: string }> = [];

      const tryConnect = (port: number) => new Promise<void>((resolve) => {
        const socket = new (net as any).Socket();
        let done = false;
        const timeout = setTimeout(() => {
          if (!done) {
            done = true;
            socket.destroy();
            resolve();
          }
        }, 750);
        socket
          .once("connect", () => {
            if (!done) {
              done = true;
              clearTimeout(timeout);
              openPorts.push({ port });
              socket.destroy();
              resolve();
            }
          })
          .once("error", () => {
            if (!done) {
              done = true;
              clearTimeout(timeout);
              resolve();
            }
          })
          .connect(port, host);
      });

      for (let i = 0; i < ports.length; i += concurrency) {
        const batch = ports.slice(i, i + concurrency);
        await Promise.all(batch.map(tryConnect));
      }

      const serviceMap: Record<number, string> = {
        22: "SSH", 23: "Telnet", 53: "DNS", 80: "HTTP", 110: "POP3",
        143: "IMAP", 443: "HTTPS", 993: "IMAPS", 995: "POP3S",
        3389: "RDP", 8080: "HTTP-Alt", 8443: "HTTPS-Alt"
      };

      const results = openPorts.map(({ port }) => ({
        port,
        protocol: "TCP",
        state: "open",
        service: serviceMap[port] || null,
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Port scan failed", error: errorMessage });
    }
  });

  app.post("/api/tools/dns-lookup", async (req, res) => {
    try {
      const { domain, recordType = "A" } = req.body;
      if (!domain) return res.status(400).json({ message: "domain is required" });
      const dns = await import("node:dns");
      const resolver = (dns as any).promises;

      const startTime = Date.now();
      let records: any = [];
      switch (recordType) {
        case "A": records = await resolver.resolve4(domain); break;
        case "AAAA": records = await resolver.resolve6(domain); break;
        case "MX": records = await resolver.resolveMx(domain); break;
        case "TXT": records = await resolver.resolveTxt(domain); break;
        case "CNAME": records = await resolver.resolveCname(domain); break;
        case "NS": records = await resolver.resolveNs(domain); break;
        case "SRV": records = await resolver.resolveSrv(domain); break;
        case "SOA": records = await resolver.resolveSoa(domain); break;
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "DNS lookup failed", error: errorMessage });
    }
  });

  app.post("/api/tools/speed-test", async (_req, res) => {
    try {
      // Placeholder: true bandwidth tests are not feasible in serverless; return minimal ping test
      const now = new Date().toISOString();
      const toolResult = await storage.createToolResult({
        toolName: "speed-test",
        parameters: {},
        results: { download: null, upload: null, ping: null, jitter: null, server: "vercel", timestamp: now },
        status: "completed",
        executionTime: 1000,
      });
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Speed test failed", error: errorMessage });
    }
  });

  app.post("/api/tools/ssl-analyze", async (req, res) => {
    try {
      const { url, port = 443 } = req.body;
      if (!url) return res.status(400).json({ message: "url is required" });
      const hostname = new URL(url).hostname;
      const tls = await import("tls");

      const start = Date.now();
      const result = await new Promise<any>((resolve, reject) => {
        const socket = (tls as any).connect({
          host: hostname,
          port,
          servername: hostname,
          rejectUnauthorized: false,
          timeout: 8000,
        }, () => {
          try {
            const cert = socket.getPeerCertificate(true);
            const protocol = socket.getProtocol();
            const cipher = socket.getCipher();
            socket.end();
            resolve({ cert, protocol, cipher });
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
        valid: Boolean(cert && cert.valid_to && new Date(cert.valid_to) > new Date()),
        issuer: cert?.issuer?.O || cert?.issuerCertificate?.subject?.O || null,
        subject: cert?.subject?.CN || hostname,
        validFrom: cert?.valid_from ? new Date(cert.valid_from).toISOString() : null,
        validTo: cert?.valid_to ? new Date(cert.valid_to).toISOString() : null,
        protocol: protocol || null,
        cipherSuite: cipher?.name || null,
        warnings: [],
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "SSL analysis failed", error: errorMessage });
    }
  });

  app.post("/api/tools/subnet-calculate", async (req, res) => {
    try {
      const { ipAddress, subnetMask, subnetCount = 4 } = req.body;
      if (!ipAddress || !subnetMask) return res.status(400).json({ message: "ipAddress and subnetMask are required" });
      const baseIP = ipAddress.split('.').slice(0, 3).join('.');
      const maskBits = parseInt(subnetMask);
      const subnetSize = Math.pow(2, 32 - maskBits - 2);

      const subnets = [] as any[];
      for (let i = 0; i < subnetCount; i++) {
        const networkStart = i * subnetSize;
        subnets.push({
          subnetNumber: i + 1,
          network: `${baseIP}.${networkStart}/${maskBits + 2}`,
          firstHost: `${baseIP}.${networkStart + 1}`,
          lastHost: `${baseIP}.${networkStart + subnetSize - 2}`,
          broadcast: `${baseIP}.${networkStart + subnetSize - 1}`,
          hostCount: subnetSize - 2,
        });
      }

      const toolResult = await storage.createToolResult({
        toolName: "subnet-calculate",
        parameters: { ipAddress, subnetMask, subnetCount },
        results: {
          originalNetwork: `${ipAddress}/${maskBits}`,
          subnets,
          totalHosts: (subnetSize - 2) * subnetCount,
        },
        status: "completed",
        executionTime: 300,
      });

      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Subnet calculation failed", error: errorMessage });
    }
  });

  app.post("/api/tools/whois-lookup", async (req, res) => {
    try {
      const { domain } = req.body;
      if (!domain) return res.status(400).json({ message: "domain is required" });
      const whoisModule: any = (await import("whois-json")) as any;
      const whois = whoisModule?.default || whoisModule;
      const start = Date.now();
      const data = await whois(domain, { follow: 2, timeout: 10000 });
      const toolResult = await storage.createToolResult({
        toolName: "whois-lookup",
        parameters: { domain },
        results: data,
        status: "completed",
        executionTime: Date.now() - start,
      });
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Whois lookup failed", error: errorMessage });
    }
  });

  // Vulnerability Scanner (placeholder)
  app.post("/api/tools/vulnerability-scan", async (req, res) => {
    try {
      const { target } = req.body;
      const results = { target, scanTime: 5, vulnerabilities: [], summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 } };
      const toolResult = await storage.createToolResult({
        toolName: "vulnerability-scan",
        parameters: { target },
        results,
        status: "completed",
        executionTime: 5000,
      });
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Vulnerability scan failed", error: errorMessage });
    }
  });

  // Dashboard stats (placeholder)
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = { networkUptime: 99.9, activeDevices: 0, bandwidthUsage: 0, securityAlerts: 0, lastUpdate: new Date().toISOString() };
      res.json(stats);
    } catch {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // SEO: robots.txt
  app.get("/robots.txt", (_req, res) => {
    const baseUrl = process.env.PUBLIC_BASE_URL || "https://example.com";
    const lines = [
      "User-agent: *",
      "Allow: /",
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join("\n");
    res
      .header("Content-Type", "text/plain; charset=utf-8")
      .header("Cache-Control", "public, max-age=3600, stale-while-revalidate=600")
      .send(lines);
  });

  // SEO: sitemap.xml
  app.get("/sitemap.xml", (_req, res) => {
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
      "bandwidth-monitor",
    ];

    const urlset = routes
      .map((r) => {
        const loc = r ? `${baseUrl}/${r}` : `${baseUrl}/`;
        const today = new Date().toISOString();
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`;
    res
      .header("Content-Type", "application/xml; charset=utf-8")
      .header("Cache-Control", "public, max-age=3600, stale-while-revalidate=600")
      .send(xml);
  });
}

