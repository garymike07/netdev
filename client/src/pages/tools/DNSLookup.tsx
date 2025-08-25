import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDNSLookup } from "@/hooks/useNetworkTools";
import { useScrollAnimation } from "@/hooks/useAnimations";
import GlassCard from "@/components/common/GlassCard";
import NeumorphButton from "@/components/common/NeumorphButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { validateDomain, exportToJSON, exportToCSV } from "@/utils/networkUtils";
import { Download, Globe, CheckCircle, Clock } from "lucide-react";

const dnsSchema = z.object({
  domain: z.string().min(1, "Domain is required").refine(
    validateDomain,
    "Please enter a valid domain name"
  ),
  recordType: z.enum(["A", "AAAA", "MX", "TXT", "CNAME", "NS"]).default("A"),
  dnsServer: z.string().optional(),
});

type DNSFormData = z.infer<typeof dnsSchema>;

const DNSLookup = () => {
  const [results, setResults] = useState<{
    domain: string;
    recordType: string;
    records: any[];
    queryTime: number;
    server: string;
    status: string;
  } | null>(null);
  
  const scrollAnimation = useScrollAnimation();
  const dnsMutation = useDNSLookup();

  const form = useForm<DNSFormData>({
    resolver: zodResolver(dnsSchema),
    defaultValues: {
      domain: "",
      recordType: "A",
      dnsServer: "",
    },
  });

  const onSubmit = async (data: DNSFormData) => {
    setResults(null);
    try {
      const result = await dnsMutation.mutateAsync(data);
      setResults(result.results);
    } catch (error) {
      console.error("DNS lookup failed:", error);
    }
  };

  const exportResults = (format: 'json' | 'csv') => {
    if (!results) return;
    
    if (format === 'json') {
      exportToJSON(results, 'dns-lookup-results');
    } else {
      const csvData = results.records.map((record, index) => ({
        domain: results.domain,
        recordType: results.recordType,
        record: typeof record === 'string' ? record : JSON.stringify(record),
        queryTime: results.queryTime,
        server: results.server,
      }));
      exportToCSV(csvData, 'dns-lookup-results');
    }
  };

  const renderRecord = (record: any, index: number) => {
    if (typeof record === 'string') {
      return (
        <div className="font-mono text-sm break-all" data-testid={`dns-record-${index}`}>
          {record}
        </div>
      );
    }
    
    if (typeof record === 'object' && record !== null) {
      return (
        <div className="space-y-1" data-testid={`dns-record-${index}`}>
          {Object.entries(record).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground capitalize">{key}:</span>
              <span className="font-mono">{String(value)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return <div className="font-mono text-sm">{String(record)}</div>;
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
            <Globe className="w-5 h-5 inline mr-2" />
            DNS Query Configuration
          </h3>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="domain" className="text-sm font-medium mb-2 block">
                Domain Name
              </Label>
              <Input
                id="domain"
                placeholder="example.com"
                {...form.register("domain")}
                className="form-input"
                data-testid="input-domain"
              />
              {form.formState.errors.domain && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.domain.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="recordType" className="text-sm font-medium mb-2 block">
                Record Type
              </Label>
              <Select
                value={form.watch("recordType")}
                onValueChange={(value) => form.setValue("recordType", value as any)}
              >
                <SelectTrigger className="form-input" data-testid="select-record-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border border-border/50">
                  <SelectItem value="A">A (IPv4 Address)</SelectItem>
                  <SelectItem value="AAAA">AAAA (IPv6 Address)</SelectItem>
                  <SelectItem value="MX">MX (Mail Exchange)</SelectItem>
                  <SelectItem value="TXT">TXT (Text Record)</SelectItem>
                  <SelectItem value="CNAME">CNAME (Canonical Name)</SelectItem>
                  <SelectItem value="NS">NS (Name Server)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dnsServer" className="text-sm font-medium mb-2 block">
                DNS Server (Optional)
              </Label>
              <Input
                id="dnsServer"
                placeholder="8.8.8.8"
                {...form.register("dnsServer")}
                className="form-input"
                data-testid="input-dns-server"
              />
            </div>

            <NeumorphButton
              type="submit"
              variant="success"
              size="lg"
              loading={dnsMutation.isPending}
              disabled={dnsMutation.isPending}
              className="w-full"
            >
              {dnsMutation.isPending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Clock className="w-5 h-5" />
                  </motion.div>
                  Resolving DNS...
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5 mr-2" />
                  Lookup DNS Records
                </>
              )}
            </NeumorphButton>
          </form>
        </GlassCard>

        {/* Results Panel */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold gradient-text">DNS Records</h3>
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
            {dnsMutation.isPending ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-neon-green"
                >
                  <Globe className="w-8 h-8" />
                </motion.div>
                <span className="ml-3 text-muted-foreground">
                  Resolving DNS records...
                </span>
              </div>
            ) : results ? (
              <>
                {/* Query Info */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-neon-green/10 rounded-lg border border-neon-green/30"
                  data-testid="dns-query-info"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Domain:</span>
                      <div className="font-semibold text-neon-green">{results.domain}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Record Type:</span>
                      <Badge variant="secondary" className="ml-2">
                        {results.recordType}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Query Time:</span>
                      <div className="font-mono">{results.queryTime}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">DNS Server:</span>
                      <div className="font-mono">{results.server}</div>
                    </div>
                  </div>
                </motion.div>

                {/* DNS Records */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground mb-2">
                    {results.recordType} Records for {results.domain}:
                  </div>
                  {results.records.length > 0 ? (
                    results.records.map((record, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start justify-between py-3 px-4 bg-gray-800/30 rounded-lg"
                      >
                        <div className="flex-1">
                          {renderRecord(record, index)}
                        </div>
                        <CheckCircle className="w-4 h-4 text-neon-green mt-1 ml-3" />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No {results.recordType} records found for {results.domain}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter a domain name and click "Lookup DNS Records"</p>
                </div>
              </div>
            )}
          </div>

          {dnsMutation.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              Error: {dnsMutation.error.message}
            </motion.div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default DNSLookup;
