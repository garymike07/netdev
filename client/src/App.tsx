import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import PingTool from "@/pages/tools/PingTool";
import PortScanner from "@/pages/tools/PortScanner";
import DNSLookup from "@/pages/tools/DNSLookup";
import SpeedTest from "@/pages/tools/SpeedTest";
import NetworkTopology from "@/pages/tools/NetworkTopology";
import SSLAnalyzer from "@/pages/tools/SSLAnalyzer";
import SubnetCalculator from "@/pages/tools/SubnetCalculator";
import WhoisLookup from "@/pages/tools/WhoisLookup";
import VulnerabilityScanner from "@/pages/tools/VulnerabilityScanner";
import BandwidthMonitor from "@/pages/tools/BandwidthMonitor";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import { useState } from "react";
import Meta from "@/components/common/Meta";
import { useLocation } from "wouter";

function Router() {
  const [location] = useLocation();

  const baseUrl = (window as any).PUBLIC_BASE_URL || window.location.origin;
  const routeToMeta: Record<string, { title: string; description: string; path: string; social?: { image?: string; twitterCard?: string } }> = {
    "/": {
      title: "Network Tools Dashboard",
      description: "Monitor, test, and analyze networks with a suite of fast tools.",
      path: "/",
    },
    "/ping": {
      title: "Ping Tool — Network Tools Dashboard",
      description: "Measure latency and packet loss to any host with configurable count and timeout.",
      path: "/ping",
      social: { twitterCard: "summary" },
    },
    "/port-scanner": {
      title: "Port Scanner — Network Tools Dashboard",
      description: "Scan TCP ports to detect open services and improve security visibility.",
      path: "/port-scanner",
      social: { twitterCard: "summary" },
    },
    "/dns-lookup": {
      title: "DNS Lookup — Network Tools Dashboard",
      description: "Query A, AAAA, MX, TXT, CNAME and more to troubleshoot DNS records.",
      path: "/dns-lookup",
      social: { twitterCard: "summary" },
    },
    "/speed-test": {
      title: "Speed Test — Network Tools Dashboard",
      description: "Run a browser-based speed test to estimate upload, download and latency.",
      path: "/speed-test",
      social: { twitterCard: "summary" },
    },
    "/network-topology": {
      title: "Network Topology — Network Tools Dashboard",
      description: "Visualize nodes and links to understand your network structure.",
      path: "/network-topology",
      social: { twitterCard: "summary" },
    },
    "/ssl-analyzer": {
      title: "SSL Analyzer — Network Tools Dashboard",
      description: "Inspect SSL certificates, expiration dates and configuration details.",
      path: "/ssl-analyzer",
      social: { twitterCard: "summary" },
    },
    "/subnet-calculator": {
      title: "Subnet Calculator — Network Tools Dashboard",
      description: "Calculate subnets, masks and ranges to plan network addressing.",
      path: "/subnet-calculator",
      social: { twitterCard: "summary" },
    },
    "/whois-lookup": {
      title: "Whois Lookup — Network Tools Dashboard",
      description: "Look up domain registration and ownership data quickly.",
      path: "/whois-lookup",
      social: { twitterCard: "summary" },
    },
    "/vulnerability-scanner": {
      title: "Vulnerability Scanner — Network Tools Dashboard",
      description: "Simulated scanner results to demonstrate security assessment workflows.",
      path: "/vulnerability-scanner",
      social: { twitterCard: "summary" },
    },
    "/bandwidth-monitor": {
      title: "Bandwidth Monitor — Network Tools Dashboard",
      description: "Track bandwidth usage trends and identify spikes over time.",
      path: "/bandwidth-monitor",
      social: { twitterCard: "summary" },
    },
  };

  const meta = routeToMeta[location] || {
    title: "Page Not Found — Network Tools Dashboard",
    description: "The requested page could not be found.",
    path: location,
  };

  return (
    <>
      <Meta
        title={meta.title}
        description={meta.description}
        canonical={`${baseUrl}${meta.path}`}
        social={{ image: undefined, twitterCard: meta.social?.twitterCard }}
      />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/ping" component={PingTool} />
        <Route path="/port-scanner" component={PortScanner} />
        <Route path="/dns-lookup" component={DNSLookup} />
        <Route path="/speed-test" component={SpeedTest} />
        <Route path="/network-topology" component={NetworkTopology} />
        <Route path="/ssl-analyzer" component={SSLAnalyzer} />
        <Route path="/subnet-calculator" component={SubnetCalculator} />
        <Route path="/whois-lookup" component={WhoisLookup} />
        <Route path="/vulnerability-scanner" component={VulnerabilityScanner} />
        <Route path="/bandwidth-monitor" component={BandwidthMonitor} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen bg-gradient-to-br from-dark-charcoal to-medium-charcoal text-foreground font-inter">
          <AnimatedBackground />
          
          <div className="flex">
            <Sidebar 
              collapsed={sidebarCollapsed} 
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
            />
            
            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
              <Header />
              
              <main className="p-6">
                <Router />
              </main>
            </div>
          </div>
          
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
