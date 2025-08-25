import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { NetworkTool, ToolResult, NetworkEvent, NetworkStats } from "@/types/network";

export function useNetworkTools() {
  return useQuery<NetworkTool[]>({
    queryKey: ["/api/tools"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useNetworkTool(id: string) {
  return useQuery<NetworkTool>({
    queryKey: ["/api/tools", id],
    enabled: !!id,
  });
}

export function useToolResults(toolName?: string, limit?: number) {
  const queryKey = ["/api/results"];
  if (toolName) queryKey.push(toolName);
  if (limit) queryKey.push(limit.toString());

  return useQuery<ToolResult[]>({
    queryKey,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useToolResult(id: string) {
  return useQuery<ToolResult>({
    queryKey: ["/api/results", id],
    enabled: !!id,
  });
}

export function useNetworkEvents(limit?: number) {
  const queryKey = ["/api/events"];
  if (limit) queryKey.push(limit.toString());

  return useQuery<NetworkEvent[]>({
    queryKey,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useDashboardStats() {
  return useQuery<NetworkStats>({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Tool execution mutations
export function usePingTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { host: string; count?: number; timeout?: number }) => {
      const response = await apiRequest("POST", "/api/tools/ping", params);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
  });
}

export function usePortScanner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { host: string; startPort?: number; endPort?: number; scanType?: string }) => {
      const response = await apiRequest("POST", "/api/tools/port-scan", params);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
  });
}

export function useDNSLookup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { domain: string; recordType?: string; dnsServer?: string }) => {
      const response = await apiRequest("POST", "/api/tools/dns-lookup", params);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
  });
}

export function useSpeedTest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/tools/speed-test", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
  });
}

export function useSSLAnalyzer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { url: string; port?: number }) => {
      const response = await apiRequest("POST", "/api/tools/ssl-analyze", params);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
  });
}

export function useSubnetCalculator() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { ipAddress: string; subnetMask: string; subnetCount?: number }) => {
      const response = await apiRequest("POST", "/api/tools/subnet-calculate", params);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
  });
}

export function useCreateToolResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (result: Omit<ToolResult, "id" | "createdAt">) => {
      const response = await apiRequest("POST", "/api/results", result);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
  });
}

export function useDeleteToolResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/results/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
  });
}

export function useCreateNetworkEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (event: Omit<NetworkEvent, "id" | "createdAt" | "resolved">) => {
      const response = await apiRequest("POST", "/api/events", event);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });
}
