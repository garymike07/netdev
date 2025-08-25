import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubnetCalculator } from "@/hooks/useNetworkTools";
import { useScrollAnimation } from "@/hooks/useAnimations";
import GlassCard from "@/components/common/GlassCard";
import NeumorphButton from "@/components/common/NeumorphButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { validateIPAddress, exportToJSON, exportToCSV, cidrToMask, maskToCidr } from "@/utils/networkUtils";
import { Download, Calculator, Network, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SubnetInfo } from "@/types/network";

const subnetSchema = z.object({
  ipAddress: z.string().min(1, "IP address is required").refine(
    validateIPAddress,
    "Please enter a valid IP address"
  ),
  subnetMask: z.string().min(1, "Subnet mask is required"),
  subnetCount: z.number().min(1).max(256).default(4),
});

type SubnetFormData = z.infer<typeof subnetSchema>;

const SubnetCalculator = () => {
  const [results, setResults] = useState<{
    originalNetwork: string;
    subnets: SubnetInfo[];
    totalHosts: number;
  } | null>(null);
  
  const scrollAnimation = useScrollAnimation();
  const subnetMutation = useSubnetCalculator();
  const { toast } = useToast();

  const form = useForm<SubnetFormData>({
    resolver: zodResolver(subnetSchema),
    defaultValues: {
      ipAddress: "",
      subnetMask: "24",
      subnetCount: 4,
    },
  });

  const onSubmit = async (data: SubnetFormData) => {
    setResults(null);
    try {
      const result = await subnetMutation.mutateAsync(data);
      setResults(result.results);
    } catch (error) {
      console.error("Subnet calculation failed:", error);
    }
  };

  const exportResults = (format: 'json' | 'csv') => {
    if (!results) return;
    
    if (format === 'json') {
      exportToJSON(results, 'subnet-calculation-results');
    } else {
      exportToCSV(results.subnets, 'subnet-calculation-results');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Network information copied successfully",
      });
    });
  };

  const subnetMaskOptions = [
    { value: "8", label: "/8 (255.0.0.0)" },
    { value: "16", label: "/16 (255.255.0.0)" },
    { value: "24", label: "/24 (255.255.255.0)" },
    { value: "25", label: "/25 (255.255.255.128)" },
    { value: "26", label: "/26 (255.255.255.192)" },
    { value: "27", label: "/27 (255.255.255.224)" },
    { value: "28", label: "/28 (255.255.255.240)" },
    { value: "29", label: "/29 (255.255.255.248)" },
    { value: "30", label: "/30 (255.255.255.252)" },
  ];

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
            <Network className="w-5 h-5 inline mr-2" />
            Network Configuration
          </h3>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="ipAddress" className="text-sm font-medium mb-2 block">
                Network IP Address
              </Label>
              <Input
                id="ipAddress"
                placeholder="192.168.1.0"
                {...form.register("ipAddress")}
                className="form-input"
                data-testid="input-ip-address"
              />
              {form.formState.errors.ipAddress && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.ipAddress.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="subnetMask" className="text-sm font-medium mb-2 block">
                Subnet Mask
              </Label>
              <Select
                value={form.watch("subnetMask")}
                onValueChange={(value) => form.setValue("subnetMask", value)}
              >
                <SelectTrigger className="form-input" data-testid="select-subnet-mask">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border border-border/50">
                  {subnetMaskOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subnetCount" className="text-sm font-medium mb-2 block">
                Number of Subnets
              </Label>
              <Input
                id="subnetCount"
                type="number"
                min="1"
                max="256"
                {...form.register("subnetCount", { valueAsNumber: true })}
                className="form-input"
                data-testid="input-subnet-count"
              />
            </div>

            <NeumorphButton
              type="submit"
              variant="cyber"
              size="lg"
              loading={subnetMutation.isPending}
              disabled={subnetMutation.isPending}
              className="w-full"
            >
              {subnetMutation.isPending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Calculator className="w-5 h-5" />
                  </motion.div>
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate Subnets
                </>
              )}
            </NeumorphButton>
          </form>

          {/* Quick Reference */}
          <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
            <h4 className="font-semibold mb-2 text-cyber-blue">Quick Reference</h4>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div>/24 = 254 hosts per subnet</div>
              <div>/25 = 126 hosts per subnet</div>
              <div>/26 = 62 hosts per subnet</div>
              <div>/27 = 30 hosts per subnet</div>
              <div>/28 = 14 hosts per subnet</div>
              <div>/29 = 6 hosts per subnet</div>
              <div>/30 = 2 hosts per subnet</div>
            </div>
          </div>
        </GlassCard>

        {/* Results Panel */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold gradient-text">Subnet Information</h3>
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
            {subnetMutation.isPending ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-indigo-500"
                >
                  <Calculator className="w-8 h-8" />
                </motion.div>
                <span className="ml-3 text-muted-foreground">
                  Calculating subnets...
                </span>
              </div>
            ) : results ? (
              <>
                {/* Summary */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/30"
                  data-testid="subnet-summary"
                >
                  <div className="text-sm">
                    <div className="font-semibold text-indigo-400 mb-2">Network Summary</div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Network:</span>
                        <span className="font-mono">{results.originalNetwork}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Subnets:</span>
                        <span>{results.subnets.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Available Hosts:</span>
                        <span>{results.totalHosts}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Subnet List */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {results.subnets.map((subnet, index) => (
                    <motion.div
                      key={subnet.subnetNumber}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-800/30 rounded-lg border border-gray-600"
                      data-testid={`subnet-${subnet.subnetNumber}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-indigo-400">
                          Subnet {subnet.subnetNumber}
                        </div>
                        <Badge variant="secondary" className="text-neon-green">
                          {subnet.hostCount} hosts
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Network:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">{subnet.network}</span>
                            <Button
                              onClick={() => copyToClipboard(subnet.network)}
                              size="sm"
                              variant="ghost"
                              className="p-1 h-auto"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">First Host:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">{subnet.firstHost}</span>
                            <Button
                              onClick={() => copyToClipboard(subnet.firstHost)}
                              size="sm"
                              variant="ghost"
                              className="p-1 h-auto"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Last Host:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">{subnet.lastHost}</span>
                            <Button
                              onClick={() => copyToClipboard(subnet.lastHost)}
                              size="sm"
                              variant="ghost"
                              className="p-1 h-auto"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Broadcast:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">{subnet.broadcast}</span>
                            <Button
                              onClick={() => copyToClipboard(subnet.broadcast)}
                              size="sm"
                              variant="ghost"
                              className="p-1 h-auto"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Configure network settings and click "Calculate Subnets"</p>
                </div>
              </div>
            )}
          </div>

          {subnetMutation.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              Error: {subnetMutation.error.message}
            </motion.div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default SubnetCalculator;
