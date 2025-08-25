import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useScrollAnimation } from "@/hooks/useAnimations";
import GlassCard from "@/components/common/GlassCard";
import NeumorphButton from "@/components/common/NeumorphButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { validateDomain, exportToJSON } from "@/utils/networkUtils";
import { Download, Search, Globe, Calendar, User, Building } from "lucide-react";

const whoisSchema = z.object({
  domain: z.string().min(1, "Domain is required").refine(
    validateDomain,
    "Please enter a valid domain name"
  ),
});

type WhoisFormData = z.infer<typeof whoisSchema>;

interface WhoisResult {
  domain: string;
  registrar: string;
  registrant: {
    name: string;
    organization: string;
    email: string;
    country: string;
  };
  admin: {
    name: string;
    email: string;
  };
  tech: {
    name: string;
    email: string;
  };
  dates: {
    created: string;
    updated: string;
    expires: string;
  };
  nameservers: string[];
  status: string[];
  dnssec: boolean;
}

const WhoisLookup = () => {
  const [results, setResults] = useState<WhoisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollAnimation = useScrollAnimation();

  const form = useForm<WhoisFormData>({
    resolver: zodResolver(whoisSchema),
    defaultValues: {
      domain: "",
    },
  });

  const onSubmit = async (data: WhoisFormData) => {
    setResults(null);
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/tools/whois-lookup", data);
      const result = await response.json();
      setResults(result.results);
    } catch (err: any) {
      setError(err.message || "Whois lookup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    exportToJSON(results, 'whois-lookup-results');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry < thirtyDaysFromNow;
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
            Domain Lookup
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

            <NeumorphButton
              type="submit"
              variant="warning"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Search className="w-5 h-5" />
                  </motion.div>
                  Looking up domain...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Lookup Domain Information
                </>
              )}
            </NeumorphButton>
          </form>
        </GlassCard>

        {/* Results Panel */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold gradient-text">Domain Information</h3>
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

          <div className="space-y-4 min-h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-orange-500"
                >
                  <Globe className="w-8 h-8" />
                </motion.div>
                <span className="ml-3 text-muted-foreground">
                  Retrieving domain information...
                </span>
              </div>
            ) : results ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
                data-testid="whois-results"
              >
                {/* Domain Overview */}
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <h4 className="font-semibold mb-3 text-orange-500 flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Domain Overview
                  </h4>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Domain:</span>
                      <span className="font-semibold text-orange-500">{results.domain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registrar:</span>
                      <span className="font-mono">{results.registrar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DNSSEC:</span>
                      <Badge variant={results.dnssec ? "secondary" : "destructive"}>
                        {results.dnssec ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Registration Dates */}
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="font-semibold mb-3 text-cyber-blue flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Important Dates
                  </h4>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatDate(results.dates.created)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{formatDate(results.dates.updated)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <div className="text-right">
                        <span className={isExpiringSoon(results.dates.expires) ? 'text-yellow-500' : ''}>
                          {formatDate(results.dates.expires)}
                        </span>
                        {isExpiringSoon(results.dates.expires) && (
                          <div className="text-xs text-yellow-500 mt-1">
                            Expires soon!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-gray-800/30 rounded-lg">
                    <h4 className="font-semibold mb-3 text-neon-green flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Registrant
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{results.registrant.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Organization:</span>
                        <span>{results.registrant.organization}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-mono text-xs">{results.registrant.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Country:</span>
                        <span>{results.registrant.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <h5 className="font-semibold mb-2 text-electric-purple text-sm">
                        Administrative Contact
                      </h5>
                      <div className="space-y-1 text-xs">
                        <div>{results.admin.name}</div>
                        <div className="text-muted-foreground font-mono">{results.admin.email}</div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <h5 className="font-semibold mb-2 text-electric-purple text-sm">
                        Technical Contact
                      </h5>
                      <div className="space-y-1 text-xs">
                        <div>{results.tech.name}</div>
                        <div className="text-muted-foreground font-mono">{results.tech.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name Servers */}
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="font-semibold mb-3 text-cyber-blue">Name Servers</h4>
                  <div className="space-y-2">
                    {results.nameservers.map((ns, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-cyber-blue rounded-full mr-3" />
                        <span className="font-mono">{ns}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Domain Status */}
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="font-semibold mb-3 text-electric-purple">Domain Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.status.map((status, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
              >
                <div className="flex items-center mb-2">
                  <Globe className="w-4 h-4 mr-2" />
                  <span className="font-medium">Lookup Failed</span>
                </div>
                <p className="text-sm">{error}</p>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter a domain name and click "Lookup Domain Information"</p>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default WhoisLookup;
