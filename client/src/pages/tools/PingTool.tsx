import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePingTool } from "@/hooks/useNetworkTools";
import { useScrollAnimation } from "@/hooks/useAnimations";
import GlassCard from "@/components/common/GlassCard";
import NeumorphButton from "@/components/common/NeumorphButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { validateDomain, validateIPAddress, exportToJSON, exportToCSV } from "@/utils/networkUtils";
import { Download, Play, Clock, Zap } from "lucide-react";
import type { PingResult, PingStatistics } from "@/types/network";

const pingSchema = z.object({
  host: z.string().min(1, "Host is required").refine(
    (val) => validateDomain(val) || validateIPAddress(val),
    "Please enter a valid domain name or IP address"
  ),
  count: z.number().min(1).max(100).default(4),
  timeout: z.number().min(100).max(30000).default(5000),
});

type PingFormData = z.infer<typeof pingSchema>;

const PingTool = () => {
  const [results, setResults] = useState<{
    pings: PingResult[];
    statistics: PingStatistics;
  } | null>(null);
  
  const scrollAnimation = useScrollAnimation();
  const pingMutation = usePingTool();

  const form = useForm<PingFormData>({
    resolver: zodResolver(pingSchema),
    defaultValues: {
      host: "",
      count: 4,
      timeout: 5000,
    },
  });

  const onSubmit = async (data: PingFormData) => {
    setResults(null);
    try {
      const result = await pingMutation.mutateAsync(data);
      setResults(result.results);
    } catch (error) {
      console.error("Ping failed:", error);
    }
  };

  const exportResults = (format: 'json' | 'csv') => {
    if (!results) return;
    
    if (format === 'json') {
      exportToJSON(results, 'ping-results');
    } else {
      exportToCSV(results.pings, 'ping-results');
    }
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
            Ping Configuration
          </h3>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="host" className="text-sm font-medium mb-2 block">
                Target Host
              </Label>
              <Input
                id="host"
                placeholder="google.com or 8.8.8.8"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="count" className="text-sm font-medium mb-2 block">
                  Packet Count
                </Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  {...form.register("count", { valueAsNumber: true })}
                  className="form-input"
                  data-testid="input-count"
                />
              </div>
              
              <div>
                <Label htmlFor="timeout" className="text-sm font-medium mb-2 block">
                  Timeout (ms)
                </Label>
                <Input
                  id="timeout"
                  type="number"
                  min="100"
                  max="30000"
                  step="100"
                  {...form.register("timeout", { valueAsNumber: true })}
                  className="form-input"
                  data-testid="input-timeout"
                />
              </div>
            </div>

            <NeumorphButton
              type="submit"
              variant="cyber"
              size="lg"
              loading={pingMutation.isPending}
              disabled={pingMutation.isPending}
              className="w-full"
            >
              {pingMutation.isPending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Clock className="w-5 h-5" />
                  </motion.div>
                  Running Ping Test...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Ping Test
                </>
              )}
            </NeumorphButton>
          </form>
        </GlassCard>

        {/* Results Panel */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold gradient-text">Results</h3>
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

          <div className="space-y-4 min-h-[300px]">
            {pingMutation.isPending ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-cyber-blue"
                >
                  <Zap className="w-8 h-8" />
                </motion.div>
                <span className="ml-3 text-muted-foreground">
                  Pinging host...
                </span>
              </div>
            ) : results ? (
              <>
                {/* Individual Ping Results */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {results.pings.map((ping, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-2 px-3 bg-gray-800/30 rounded"
                      data-testid={`ping-result-${index}`}
                    >
                      <span className="font-mono text-sm">
                        Reply from {ping.host}: bytes={ping.bytes} time={ping.time}ms TTL={ping.ttl}
                      </span>
                      <Badge variant="secondary" className="text-neon-green">
                        {ping.time}ms
                      </Badge>
                    </motion.div>
                  ))}
                </div>

                {/* Statistics Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-cyber-blue/10 rounded-lg border border-cyber-blue/30"
                  data-testid="ping-statistics"
                >
                  <h4 className="font-semibold text-cyber-blue mb-3">Statistics Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Packets:</span>
                      <div className="font-mono">
                        Sent = {results.statistics.sent}, 
                        Received = {results.statistics.received}, 
                        Lost = {results.statistics.lost} ({results.statistics.lossPercent}% loss)
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Round Trip Times:</span>
                      <div className="font-mono">
                        Min = {results.statistics.minTime}ms, 
                        Max = {results.statistics.maxTime}ms, 
                        Avg = {results.statistics.avgTime}ms
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter a target host and click "Start Ping Test" to begin</p>
                </div>
              </div>
            )}
          </div>

          {pingMutation.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              Error: {pingMutation.error.message}
            </motion.div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default PingTool;
