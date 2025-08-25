import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePortScanner } from "@/hooks/useNetworkTools";
import { useScrollAnimation } from "@/hooks/useAnimations";
import GlassCard from "@/components/common/GlassCard";
import NeumorphButton from "@/components/common/NeumorphButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { validateDomain, validateIPAddress, validatePort, exportToJSON, exportToCSV } from "@/utils/networkUtils";
import { Download, Search, Shield, CheckCircle } from "lucide-react";
import type { PortScanResult } from "@/types/network";

const portScanSchema = z.object({
  host: z.string().min(1, "Host is required").refine(
    (val) => validateDomain(val) || validateIPAddress(val),
    "Please enter a valid domain name or IP address"
  ),
  startPort: z.number().min(1).max(65535).default(1),
  endPort: z.number().min(1).max(65535).default(1000),
  scanType: z.enum(["tcp", "udp", "syn"]).default("tcp"),
}).refine((data) => data.startPort <= data.endPort, {
  message: "Start port must be less than or equal to end port",
  path: ["endPort"],
});

type PortScanFormData = z.infer<typeof portScanSchema>;

const PortScanner = () => {
  const [results, setResults] = useState<{
    host: string;
    openPorts: PortScanResult[];
    totalScanned: number;
    openCount: number;
  } | null>(null);
  
  const scrollAnimation = useScrollAnimation();
  const scanMutation = usePortScanner();

  const form = useForm<PortScanFormData>({
    resolver: zodResolver(portScanSchema),
    defaultValues: {
      host: "",
      startPort: 1,
      endPort: 1000,
      scanType: "tcp",
    },
  });

  const onSubmit = async (data: PortScanFormData) => {
    setResults(null);
    try {
      const result = await scanMutation.mutateAsync(data);
      setResults(result.results);
    } catch (error) {
      console.error("Port scan failed:", error);
    }
  };

  const exportResults = (format: 'json' | 'csv') => {
    if (!results) return;
    
    if (format === 'json') {
      exportToJSON(results, 'port-scan-results');
    } else {
      exportToCSV(results.openPorts, 'port-scan-results');
    }
  };

  const getPortColor = (port: number) => {
    if (port <= 1023) return "text-red-400"; // Well-known ports
    if (port <= 49151) return "text-yellow-500"; // Registered ports
    return "text-cyber-blue"; // Dynamic/private ports
  };

  return (
    <motion.div
      ref={scrollAnimation.ref}
      variants={scrollAnimation.variants}
      transition={scrollAnimation.transition}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 gradient-text">
            <Shield className="w-5 h-5 inline mr-2" />
            Scan Configuration
          </h3>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="host" className="text-sm font-medium mb-2 block">
                Target Host
              </Label>
              <Input
                id="host"
                placeholder="192.168.1.1 or example.com"
                {...form.register("host")}
                className="form-input"
                data-testid="input-host"
              />
              {form.formState.errors.host && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.host.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Port Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Start Port"
                  type="number"
                  min="1"
                  max="65535"
                  {...form.register("startPort", { valueAsNumber: true })}
                  className="form-input"
                  data-testid="input-start-port"
                />
                <Input
                  placeholder="End Port"
                  type="number"
                  min="1"
                  max="65535"
                  {...form.register("endPort", { valueAsNumber: true })}
                  className="form-input"
                  data-testid="input-end-port"
                />
              </div>
              {form.formState.errors.endPort && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.endPort.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="scanType" className="text-sm font-medium mb-2 block">
                Scan Type
              </Label>
              <Select
                value={form.watch("scanType")}
                onValueChange={(value) => form.setValue("scanType", value as "tcp" | "udp" | "syn")}
              >
                <SelectTrigger className="form-input" data-testid="select-scan-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border border-border/50">
                  <SelectItem value="tcp">TCP Connect Scan</SelectItem>
                  <SelectItem value="udp">UDP Scan</SelectItem>
                  <SelectItem value="syn">SYN Stealth Scan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <NeumorphButton
              type="submit"
              variant="primary"
              size="lg"
              loading={scanMutation.isPending}
              disabled={scanMutation.isPending}
              className="w-full"
            >
              {scanMutation.isPending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Search className="w-5 h-5" />
                  </motion.div>
                  Scanning Ports...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Start Port Scan
                </>
              )}
            </NeumorphButton>
          </form>
        </GlassCard>

        {/* Results Panel */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold gradient-text">Open Ports</h3>
            {results && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => exportResults('json')}
                  size="sm"
                  variant="ghost"
                  className="text-cyber-blue hover:text-cyber-blue/80"
                  data-testid="export-json"
                >
                  <Download className="w-4 h-4 mr-1" />
                  JSON
                </Button>
                <Button
                  onClick={() => exportResults('csv')}
                  size="sm"
                  variant="ghost"
                  className="text-cyber-blue hover:text-cyber-blue/80"
                  data-testid="export-csv"
                >
                  <Download className="w-4 h-4 mr-1" />
                  CSV
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4 min-h-[400px]">
            {scanMutation.isPending ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-electric-purple"
                >
                  <Search className="w-8 h-8" />
                </motion.div>
                <span className="ml-3 text-muted-foreground">
                  Scanning ports...
                </span>
              </div>
            ) : results ? (
              <>
                {/* Scan Summary */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-electric-purple/10 rounded-lg border border-electric-purple/30"
                  data-testid="scan-summary"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Scan complete: {results.openCount} open ports found
                    </span>
                    <span className="text-electric-purple font-medium">
                      {results.totalScanned} ports scanned
                    </span>
                  </div>
                </motion.div>

                {/* Open Ports List */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {results.openPorts.length > 0 ? (
                    results.openPorts.map((port, index) => (
                      <motion.div
                        key={`${port.port}-${port.protocol}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between py-3 px-4 bg-gray-800/30 rounded-lg"
                        data-testid={`port-result-${port.port}`}
                      >
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-neon-green mr-3" />
                          <div>
                            <span className={`font-semibold ${getPortColor(port.port)}`}>
                              Port {port.port}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              ({port.protocol})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-neon-green">
                            {port.state}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {port.service}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No open ports found in the specified range</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Configure scan settings and click "Start Port Scan"</p>
                </div>
              </div>
            )}
          </div>

          {scanMutation.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              Error: {scanMutation.error.message}
            </motion.div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default PortScanner;
