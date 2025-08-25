import { type User, type InsertUser, type NetworkTool, type InsertNetworkTool, type ToolResult, type InsertToolResult, type NetworkEvent, type InsertNetworkEvent } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Network Tools
  getNetworkTools(): Promise<NetworkTool[]>;
  getNetworkTool(id: string): Promise<NetworkTool | undefined>;
  createNetworkTool(tool: InsertNetworkTool): Promise<NetworkTool>;
  updateNetworkTool(id: string, tool: Partial<InsertNetworkTool>): Promise<NetworkTool | undefined>;

  // Tool Results
  getToolResults(toolName?: string, limit?: number): Promise<ToolResult[]>;
  getToolResult(id: string): Promise<ToolResult | undefined>;
  createToolResult(result: InsertToolResult): Promise<ToolResult>;
  deleteToolResult(id: string): Promise<boolean>;

  // Network Events
  getNetworkEvents(limit?: number): Promise<NetworkEvent[]>;
  getNetworkEvent(id: string): Promise<NetworkEvent | undefined>;
  createNetworkEvent(event: InsertNetworkEvent): Promise<NetworkEvent>;
  updateNetworkEvent(id: string, event: Partial<InsertNetworkEvent>): Promise<NetworkEvent | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private networkTools: Map<string, NetworkTool>;
  private toolResults: Map<string, ToolResult>;
  private networkEvents: Map<string, NetworkEvent>;

  constructor() {
    this.users = new Map();
    this.networkTools = new Map();
    this.toolResults = new Map();
    this.networkEvents = new Map();
    
    // Initialize with default network tools
    this.initializeDefaultTools();
    this.initializeMockEvents();
  }

  private initializeDefaultTools() {
    const defaultTools: InsertNetworkTool[] = [
      { name: "Ping Tool", category: "discovery", description: "Test network connectivity and latency", icon: "satellite-dish", enabled: true },
      { name: "Port Scanner", category: "discovery", description: "Scan for open ports and services", icon: "search", enabled: true },
      { name: "DNS Lookup", category: "dns", description: "Resolve domain names and IP addresses", icon: "globe", enabled: true },
      { name: "Whois Lookup", category: "dns", description: "Domain registration information", icon: "info-circle", enabled: true },
      { name: "Speed Test", category: "monitoring", description: "Measure internet speed and latency", icon: "tachometer-alt", enabled: true },
      { name: "Network Topology", category: "monitoring", description: "Visualize network structure", icon: "project-diagram", enabled: true },
      { name: "SSL Analyzer", category: "security", description: "Analyze SSL certificates", icon: "lock", enabled: true },
      { name: "Vulnerability Scanner", category: "security", description: "Scan for security vulnerabilities", icon: "shield-alt", enabled: true },
      { name: "Subnet Calculator", category: "tools", description: "Calculate network subnets", icon: "calculator", enabled: true },
      { name: "Bandwidth Monitor", category: "monitoring", description: "Monitor real-time bandwidth usage", icon: "chart-line", enabled: true },
    ];

    defaultTools.forEach(tool => {
      const id = randomUUID();
      this.networkTools.set(id, {
        ...tool,
        id,
        description: tool.description || null,
        icon: tool.icon || null,
        enabled: tool.enabled || null,
        createdAt: new Date(),
      });
    });
  }

  private initializeMockEvents() {
    const mockEvents: InsertNetworkEvent[] = [
      { eventType: "device_connected", severity: "info", message: "Device connected: 192.168.1.104", source: "network_monitor", metadata: null, resolved: false },
      { eventType: "high_bandwidth", severity: "warning", message: "High bandwidth usage detected on Server-01", source: "bandwidth_monitor", metadata: null, resolved: false },
      { eventType: "security_alert", severity: "error", message: "Suspicious activity detected from external IP", source: "security_scanner", metadata: null, resolved: false },
      { eventType: "backup_completed", severity: "info", message: "Configuration backup completed successfully", source: "backup_system", metadata: null, resolved: false },
    ];

    mockEvents.forEach(event => {
      const id = randomUUID();
      this.networkEvents.set(id, {
        ...event,
        id,
        source: event.source || null,
        metadata: event.metadata || null,
        resolved: event.resolved || null,
        createdAt: new Date(),
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Network Tool methods
  async getNetworkTools(): Promise<NetworkTool[]> {
    return Array.from(this.networkTools.values());
  }

  async getNetworkTool(id: string): Promise<NetworkTool | undefined> {
    return this.networkTools.get(id);
  }

  async createNetworkTool(tool: InsertNetworkTool): Promise<NetworkTool> {
    const id = randomUUID();
    const networkTool: NetworkTool = {
      ...tool,
      id,
      createdAt: new Date(),
    };
    this.networkTools.set(id, networkTool);
    return networkTool;
  }

  async updateNetworkTool(id: string, tool: Partial<InsertNetworkTool>): Promise<NetworkTool | undefined> {
    const existing = this.networkTools.get(id);
    if (!existing) return undefined;

    const updated: NetworkTool = { ...existing, ...tool };
    this.networkTools.set(id, updated);
    return updated;
  }

  // Tool Result methods
  async getToolResults(toolName?: string, limit?: number): Promise<ToolResult[]> {
    let results = Array.from(this.toolResults.values());
    
    if (toolName) {
      results = results.filter(result => result.toolName === toolName);
    }
    
    results.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
    if (limit) {
      results = results.slice(0, limit);
    }
    
    return results;
  }

  async getToolResult(id: string): Promise<ToolResult | undefined> {
    return this.toolResults.get(id);
  }

  async createToolResult(result: InsertToolResult): Promise<ToolResult> {
    const id = randomUUID();
    const toolResult: ToolResult = {
      ...result,
      id,
      userId: result.userId || null,
      parameters: result.parameters || null,
      results: result.results || null,
      executionTime: result.executionTime || null,
      createdAt: new Date(),
    };
    this.toolResults.set(id, toolResult);
    return toolResult;
  }

  async deleteToolResult(id: string): Promise<boolean> {
    return this.toolResults.delete(id);
  }

  // Network Event methods
  async getNetworkEvents(limit?: number): Promise<NetworkEvent[]> {
    let events = Array.from(this.networkEvents.values());
    events.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    
    if (limit) {
      events = events.slice(0, limit);
    }
    
    return events;
  }

  async getNetworkEvent(id: string): Promise<NetworkEvent | undefined> {
    return this.networkEvents.get(id);
  }

  async createNetworkEvent(event: InsertNetworkEvent): Promise<NetworkEvent> {
    const id = randomUUID();
    const networkEvent: NetworkEvent = {
      ...event,
      id,
      source: event.source || null,
      metadata: event.metadata || null,
      resolved: event.resolved || null,
      createdAt: new Date(),
    };
    this.networkEvents.set(id, networkEvent);
    return networkEvent;
  }

  async updateNetworkEvent(id: string, event: Partial<InsertNetworkEvent>): Promise<NetworkEvent | undefined> {
    const existing = this.networkEvents.get(id);
    if (!existing) return undefined;

    const updated: NetworkEvent = { ...existing, ...event };
    this.networkEvents.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
