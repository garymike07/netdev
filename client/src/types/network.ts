export interface NetworkTool {
  id: string;
  name: string;
  category: string;
  description: string;
  icon?: string;
  enabled?: boolean;
  createdAt?: Date;
}

export interface ToolResult {
  id: string;
  toolName: string;
  userId?: string;
  parameters: Record<string, any>;
  results: Record<string, any>;
  status: string;
  executionTime?: number;
  createdAt?: Date;
}

export interface NetworkEvent {
  id: string;
  message: string;
  eventType: string;
  severity: string;
  source?: string;
  metadata?: Record<string, any>;
  resolved?: boolean;
  createdAt?: Date;
}

export interface NetworkStats {
  networkUptime: number;
  activeDevices: number;
  bandwidthUsage: number;
  securityAlerts: number;
  lastUpdate: string;
}

export interface PingResult {
  sequence: number;
  host: string;
  time: number;
  ttl: number;
  bytes: number;
}

export interface PingStatistics {
  sent: number;
  received: number;
  lost: number;
  lossPercent: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
}

export interface PortScanResult {
  port: number;
  protocol: string;
  state: string;
  service: string;
}

export interface DNSRecord {
  priority?: number;
  exchange?: string;
  [key: string]: any;
}

export interface SSLInfo {
  hostname: string;
  port: number;
  valid: boolean;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  keySize: number;
  signatureAlgorithm: string;
  protocol: string;
  cipherSuite: string;
  grade: string;
  warnings: string[];
}

export interface SubnetInfo {
  subnetNumber: number;
  network: string;
  firstHost: string;
  lastHost: string;
  broadcast: string;
  hostCount: number;
}

export interface NetworkDevice {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'server' | 'pc' | 'printer' | 'ap';
  ip: string;
  status: 'online' | 'offline' | 'warning';
  connections: string[];
  position: { x: number; y: number };
}

export interface NetworkConnection {
  id: string;
  from: string;
  to: string;
  type: 'ethernet' | 'wireless' | 'fiber';
  status: 'active' | 'inactive' | 'error';
  bandwidth?: string;
}

export interface ToolExecutionParams {
  [key: string]: any;
}

export interface ToolExecutionResult {
  id: string;
  toolName: string;
  parameters: ToolExecutionParams;
  results: any;
  status: 'running' | 'completed' | 'error';
  executionTime?: number;
  createdAt?: string;
}