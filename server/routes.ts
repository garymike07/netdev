import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertToolResultSchema, insertNetworkEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Network Tools API
  app.get("/api/tools", async (req, res) => {
    try {
      const tools = await storage.getNetworkTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network tools" });
    }
  });

  app.get("/api/tools/:id", async (req, res) => {
    try {
      const tool = await storage.getNetworkTool(req.params.id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  // Tool Results API
  app.get("/api/results", async (req, res) => {
    try {
      const { toolName, limit } = req.query;
      const results = await storage.getToolResults(
        toolName as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(results);
    } catch (error) {
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
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch result" });
    }
  });

  app.delete("/api/results/:id", async (req, res) => {
    try {
      const success = await storage.deleteToolResult(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Result not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete result" });
    }
  });

  // Network Events API
  app.get("/api/events", async (req, res) => {
    try {
      const { limit } = req.query;
      const events = await storage.getNetworkEvents(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(events);
    } catch (error) {
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

      const { execFile } = await import("child_process");
      const { promisify } = await import("util");
      const execFileAsync = promisify(execFile);

      const isWindows = process.platform === "win32";
      const args = isWindows
        ? ["-n", String(count), host]
        : ["-c", String(count), "-w", String(Math.ceil(timeout / 1000)), host];

      const start = Date.now();
      const { stdout } = await execFileAsync("ping", args, { timeout });

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
      if (startPort < 1 || endPort > 65535 || startPort > endPort) {
        return res.status(400).json({ message: "invalid port range" });
      }

      const net = await import("net");
      const concurrency = 200;
      const ports = Array.from({ length: endPort - startPort + 1 }, (_, i) => startPort + i);

      const startTime = Date.now();
      const openPorts: Array<{ port: number; service?: string }> = [];

      const tryConnect = (port: number) => new Promise<void>((resolve) => {
        const socket = new net.Socket();
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
      const resolver = dns.promises;

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

  app.post("/api/tools/speed-test", async (req, res) => {
    try {
      // Simulate speed test
      const downloadSpeed = Math.floor(Math.random() * 80) + 20;
      const uploadSpeed = Math.floor(Math.random() * 30) + 5;
      const ping = Math.floor(Math.random() * 30) + 10;
      const jitter = Math.floor(Math.random() * 5) + 1;
      
      const toolResult = await storage.createToolResult({
        toolName: "speed-test",
        parameters: {},
        results: {
          download: downloadSpeed,
          upload: uploadSpeed,
          ping,
          jitter,
          server: "speedtest.example.com",
          timestamp: new Date().toISOString()
        },
        status: "completed",
        executionTime: 15000
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
        const socket = tls.connect({
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
      
      // Simulate subnet calculation
      const baseIP = ipAddress.split('.').slice(0, 3).join('.');
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
        executionTime: 500
      });
      
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Subnet calculation failed", error: errorMessage });
    }
  });

  // Whois Lookup
  app.post("/api/tools/whois-lookup", async (req, res) => {
    try {
      const { domain } = req.body;
      if (!domain) return res.status(400).json({ message: "domain is required" });
      const whoisModule: any = (await import("whois-json")) as any;
      const whois = (whoisModule && whoisModule.default) ? whoisModule.default : whoisModule;

      const start = Date.now();
      const data = await whois(domain, { follow: 2, timeout: 10000 });

      const toolResult = await storage.createToolResult({
        toolName: "whois-lookup",
        parameters: { domain },
        results: data,
        status: "completed",
        executionTime: Date.now() - start
      });

      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Whois lookup failed", error: errorMessage });
    }
  });

  // Vulnerability Scanner
  app.post("/api/tools/vulnerability-scan", async (req, res) => {
    try {
      const { target, scanPorts, scanSSL, scanHeaders, scanWebApps, aggressive } = req.body;
      
      // Simulate vulnerability scanning
      const mockVulnerabilities = [
        {
          id: "vuln-001",
          severity: "high" as const,
          title: "Outdated SSH Server Version",
          description: "The SSH server is running an outdated version that may contain security vulnerabilities.",
          solution: "Update SSH server to the latest version and disable weak encryption algorithms.",
          cve: "CVE-2023-1234",
          port: 22,
          service: "SSH"
        },
        {
          id: "vuln-002", 
          severity: "medium" as const,
          title: "Missing Security Headers",
          description: "The web server is missing important security headers like X-Frame-Options and Content-Security-Policy.",
          solution: "Configure web server to include proper security headers in HTTP responses.",
          port: 80,
          service: "HTTP"
        },
        {
          id: "vuln-003",
          severity: "low" as const,
          title: "Server Information Disclosure",
          description: "The web server is revealing detailed version information in HTTP headers.",
          solution: "Configure web server to hide version information in response headers.",
          port: 80,
          service: "HTTP"
        }
      ];

      // Filter vulnerabilities based on scan options
      let vulnerabilities: any[] = [];
      if (scanPorts && Math.random() > 0.3) {
        vulnerabilities.push(mockVulnerabilities[0]);
      }
      if (scanHeaders && Math.random() > 0.4) {
        vulnerabilities.push(mockVulnerabilities[1]);
      }
      if (scanSSL && Math.random() > 0.6) {
        vulnerabilities.push(mockVulnerabilities[2]);
      }
      
      // Add critical vulnerability occasionally
      if (aggressive && Math.random() > 0.8) {
        vulnerabilities.push({
          id: "vuln-critical-001",
          severity: "critical" as const,
          title: "Remote Code Execution Vulnerability",
          description: "A critical vulnerability allows remote code execution without authentication.",
          solution: "Immediately apply security patches and restart affected services.",
          cve: "CVE-2023-5678",
          port: 443,
          service: "HTTPS"
        });
      }

      const summary = {
        total: vulnerabilities.length,
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length
      };

      const results = {
        target,
        scanTime: Math.floor(Math.random() * 30) + 15,
        vulnerabilities,
        summary,
        ports: {
          total: 1000,
          open: Math.floor(Math.random() * 20) + 5,
          filtered: Math.floor(Math.random() * 10) + 2
        }
      };
      
      const toolResult = await storage.createToolResult({
        toolName: "vulnerability-scan",
        parameters: { target, scanPorts, scanSSL, scanHeaders, scanWebApps, aggressive },
        results,
        status: "completed",
        executionTime: results.scanTime * 1000
      });
      
      res.json(toolResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Vulnerability scan failed", error: errorMessage });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // Simulate dashboard statistics
      const stats = {
        networkUptime: 99.8,
        activeDevices: 247,
        bandwidthUsage: 847,
        securityAlerts: 3,
        lastUpdate: new Date().toISOString()
      };
      
      res.json(stats);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
