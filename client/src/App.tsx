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

function Router() {
  return (
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
