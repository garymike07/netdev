import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSSLAnalyzer } from "@/hooks/useNetworkTools";
import { useScrollAnimation } from "@/hooks/useAnimations";
import GlassCard from "@/components/common/GlassCard";
import NeumorphButton from "@/components/common/NeumorphButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { exportToJSON } from "@/utils/networkUtils";
import { Download, Lock, Shield, AlertTriangle, CheckCircle, Calendar, Key } from "lucide-react";
import type { SSLInfo } from "@/types/network";

const sslSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  port: z.number().min(1).max(65535).default(443),
  checkChain: z.boolean().default(true),
  checkCiphers: z.boolean().default(true),
  checkHeaders: z.boolean().default(true),
  checkVulnerabilities: z.boolean().default(false),
});

type SSLFormData = z.infer<typeof sslSchema>;

const SSLAnalyzer = () => {
  const [results, setResults] = useState<SSLInfo | null>(null);
  
  const scrollAnimation = useScrollAnimation();
  const sslMutation = useSSLAnalyzer();

  const form = useForm<SSLFormData>({
    resolver: zodResolver(sslSchema),
    defaultValues: {
      url: "",
      port: 443,
      checkChain: true,
      checkCiphers: true,
      checkHeaders: true,
      checkVulnerabilities: false,
    },
  });

  const onSubmit = async (data: SSLFormData) => {
    setResults(null);
    try {
      const result = await sslMutation.mutateAsync(data);
      setResults(result.results);
    } catch (error) {
      console.error("SSL analysis failed:", error);
    }
  };

  const exportResults = () => {
    if (!results) return;
    exportToJSON(results, 'ssl-analysis-results');
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-neon-green bg-neon-green/20';
      case 'B':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'C':
        return 'text-orange-500 bg-orange-500/20';
      case 'D':
      case 'F':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getGradeScore = (grade: string) => {
    const scores = { 'A+': 100, 'A': 90, 'B': 80, 'C': 70, 'D': 60, 'F': 40 };
    return scores[grade as keyof typeof scores] || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (validTo: string) => {
    const expiryDate = new Date(validTo);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate < thirtyDaysFromNow;
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
            SSL/TLS Configuration
          </h3>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="url" className="text-sm font-medium mb-2 block">
                Target URL
              </Label>
              <Input
                id="url"
                placeholder="https://example.com"
                {...form.register("url")}
                className="form-input"
                data-testid="input-url"
              />
              {form.formState.errors.url && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.url.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="port" className="text-sm font-medium mb-2 block">
                Port
              </Label>
              <Input
                id="port"
                type="number"
                min="1"
                max="65535"
                {...form.register("port", { valueAsNumber: true })}
                className="form-input"
                data-testid="input-port"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Analysis Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkChain"
                    checked={form.watch("checkChain")}
                    onCheckedChange={(checked) => form.setValue("checkChain", !!checked)}
                    data-testid="checkbox-chain"
                  />
                  <Label htmlFor="checkChain" className="text-sm">
                    Certificate Chain Analysis
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkCiphers"
                    checked={form.watch("checkCiphers")}
                    onCheckedChange={(checked) => form.setValue("checkCiphers", !!checked)}
                    data-testid="checkbox-ciphers"
                  />
                  <Label htmlFor="checkCiphers" className="text-sm">
                    Cipher Suite Analysis
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkHeaders"
                    checked={form.watch("checkHeaders")}
                    onCheckedChange={(checked) => form.setValue("checkHeaders", !!checked)}
                    data-testid="checkbox-headers"
                  />
                  <Label htmlFor="checkHeaders" className="text-sm">
                    Security Headers Check
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkVulnerabilities"
                    checked={form.watch("checkVulnerabilities")}
                    onCheckedChange={(checked) => form.setValue("checkVulnerabilities", !!checked)}
                    data-testid="checkbox-vulnerabilities"
                  />
                  <Label htmlFor="checkVulnerabilities" className="text-sm">
                    Vulnerability Scan
                  </Label>
                </div>
              </div>
            </div>

            <NeumorphButton
              type="submit"
              variant="success"
              size="lg"
              loading={sslMutation.isPending}
              disabled={sslMutation.isPending}
              className="w-full"
            >
              {sslMutation.isPending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Shield className="w-5 h-5" />
                  </motion.div>
                  Analyzing SSL...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Analyze SSL Certificate
                </>
              )}
            </NeumorphButton>
          </form>
        </GlassCard>

        {/* Results Panel */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold gradient-text">SSL Certificate Analysis</h3>
            {results && (
              <Button
                onClick={exportResults}
                size="sm"
                variant="ghost"
                className="text-cyber-blue hover:text-cyber-blue/80"
                data-testid="export-results"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            )}
          </div>

          <div className="space-y-4 min-h-[400px]">
            {sslMutation.isPending ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-green-500"
                >
                  <Lock className="w-8 h-8" />
                </motion.div>
                <span className="ml-3 text-muted-foreground">
                  Analyzing SSL certificate...
                </span>
              </div>
            ) : results ? (
              <>
                {/* Security Grade */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center mb-6"
                >
                  <div className="flex items-center justify-center mb-3">
                    {results.valid ? (
                      <CheckCircle className="w-6 h-6 text-neon-green mr-2" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
                    )}
                    <h4 className="text-lg font-semibold">
                      Certificate {results.valid ? 'Valid' : 'Invalid'}
                    </h4>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getGradeColor(results.grade)}`}>
                        {results.grade}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Security Grade</div>
                    </div>
                    
                    <div className="flex-1 max-w-32">
                      <Progress 
                        value={getGradeScore(results.grade)} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1 text-center">
                        {getGradeScore(results.grade)}%
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Certificate Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                  data-testid="certificate-details"
                >
                  <div className="p-4 bg-gray-800/30 rounded-lg">
                    <h4 className="font-semibold mb-3 text-green-500 flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Certificate Information
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subject:</span>
                        <span className="font-mono text-right">{results.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issuer:</span>
                        <span className="font-mono text-right">{results.issuer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valid From:</span>
                        <span className="text-right">{formatDate(results.validFrom)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valid Until:</span>
                        <div className="text-right">
                          <span className={isExpiringSoon(results.validTo) ? 'text-yellow-500' : ''}>
                            {formatDate(results.validTo)}
                          </span>
                          {isExpiringSoon(results.validTo) && (
                            <div className="text-xs text-yellow-500 flex items-center justify-end mt-1">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Expires soon
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800/30 rounded-lg">
                    <h4 className="font-semibold mb-3 text-cyber-blue flex items-center">
                      <Key className="w-4 h-4 mr-2" />
                      Technical Details
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Key Size:</span>
                        <Badge variant="secondary">{results.keySize} bit</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Signature Algorithm:</span>
                        <span className="font-mono">{results.signatureAlgorithm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Protocol:</span>
                        <span className="font-mono">{results.protocol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cipher Suite:</span>
                        <span className="font-mono text-right text-xs">
                          {results.cipherSuite}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {results.warnings && results.warnings.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                    >
                      <h4 className="font-semibold mb-2 text-yellow-500 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Warnings
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {results.warnings.map((warning, index) => (
                          <li key={index} className="text-yellow-500">
                            • {warning}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </motion.div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter a URL and click "Analyze SSL Certificate"</p>
                </div>
              </div>
            )}
          </div>

          {sslMutation.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              Error: {sslMutation.error.message}
            </motion.div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default SSLAnalyzer;
