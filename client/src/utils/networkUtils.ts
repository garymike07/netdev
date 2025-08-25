export const validateIPAddress = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

export const validateDomain = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain);
};

export const validatePort = (port: number): boolean => {
  return port >= 1 && port <= 65535;
};

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatLatency = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'online':
    case 'active':
    case 'success':
    case 'completed':
      return 'text-neon-green';
    case 'warning':
    case 'high':
      return 'text-yellow-500';
    case 'error':
    case 'critical':
    case 'failed':
      return 'text-red-500';
    case 'offline':
    case 'inactive':
      return 'text-gray-500';
    default:
      return 'text-cyber-blue';
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'online':
    case 'active':
    case 'success':
    case 'completed':
      return 'check-circle';
    case 'warning':
    case 'high':
      return 'exclamation-triangle';
    case 'error':
    case 'critical':
    case 'failed':
      return 'times-circle';
    case 'offline':
    case 'inactive':
      return 'minus-circle';
    case 'running':
    case 'loading':
      return 'spinner';
    default:
      return 'info-circle';
  }
};

export const calculateSubnetMask = (cidr: number): string => {
  const mask = (0xFFFFFFFF << (32 - cidr)) >>> 0;
  return [
    (mask >>> 24) & 0xFF,
    (mask >>> 16) & 0xFF,
    (mask >>> 8) & 0xFF,
    mask & 0xFF
  ].join('.');
};

export const cidrToMask = (cidr: number): string => {
  return calculateSubnetMask(cidr);
};

export const maskToCidr = (mask: string): number => {
  const parts = mask.split('.').map(part => parseInt(part));
  let cidr = 0;
  
  for (const part of parts) {
    for (let i = 7; i >= 0; i--) {
      if ((part >> i) & 1) {
        cidr++;
      } else {
        return cidr;
      }
    }
  }
  
  return cidr;
};

export const isPrivateIP = (ip: string): boolean => {
  const parts = ip.split('.').map(part => parseInt(part));
  
  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  return false;
};

export const getNetworkClass = (ip: string): 'A' | 'B' | 'C' | 'D' | 'E' | 'Unknown' => {
  const firstOctet = parseInt(ip.split('.')[0]);
  
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D';
  if (firstOctet >= 240 && firstOctet <= 255) return 'E';
  
  return 'Unknown';
};

export const generateMockLatency = (): number => {
  return Math.floor(Math.random() * 100) + 10;
};

export const generateMockBandwidth = (): { download: number; upload: number } => {
  return {
    download: Math.floor(Math.random() * 100) + 20,
    upload: Math.floor(Math.random() * 50) + 10
  };
};

export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: any, filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};
