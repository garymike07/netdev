import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, LogOut, User } from "lucide-react";

const Header = () => {
  const [location] = useLocation();
  
  const getPageInfo = (path: string) => {
    const routes = {
      "/": { title: "Network Dashboard", description: "Real-time network monitoring and management" },
      "/ping": { title: "Ping Tool", description: "Test network connectivity and latency" },
      "/port-scanner": { title: "Port Scanner", description: "Scan for open ports and services" },
      "/dns-lookup": { title: "DNS Lookup", description: "Resolve domain names and IP addresses" },
      "/speed-test": { title: "Speed Test", description: "Measure internet speed and latency" },
      "/network-topology": { title: "Network Topology", description: "Visualize network structure and connections" },
      "/ssl-analyzer": { title: "SSL Analyzer", description: "Analyze SSL certificates and security" },
      "/subnet-calculator": { title: "Subnet Calculator", description: "Calculate network subnets and IP ranges" },
      "/whois-lookup": { title: "Whois Lookup", description: "Domain registration and ownership information" },
      "/vulnerability-scanner": { title: "Vulnerability Scanner", description: "Scan for security vulnerabilities" },
      "/bandwidth-monitor": { title: "Bandwidth Monitor", description: "Monitor real-time bandwidth usage" },
    };
    
    return routes[path as keyof typeof routes] || { 
      title: "Network Tools", 
      description: "Professional network management platform" 
    };
  };

  const pageInfo = getPageInfo(location);
  const mockNotifications = 3;
  const mockUser = { name: "Admin", initials: "AD" };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card border-b border-border/50 p-4 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between">
        <motion.div
          key={location}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 
            className="text-2xl font-bold gradient-text animate-glow"
            data-testid="page-title"
          >
            {pageInfo.title}
          </h2>
          <p 
            className="text-muted-foreground mt-1"
            data-testid="page-description"
          >
            {pageInfo.description}
          </p>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          {/* Network Status */}
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <motion.div
              className="w-3 h-3 bg-neon-green rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            <span className="text-sm text-muted-foreground">
              Network Online
            </span>
          </motion.div>
          
          {/* Notifications */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 rounded-lg hover:bg-glass-white/20"
              data-testid="notifications-button"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {mockNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {mockNotifications}
                </Badge>
              )}
            </Button>
          </motion.div>
          
          {/* Settings */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg hover:bg-glass-white/20"
              data-testid="settings-button"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </motion.div>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 hover:bg-glass-white/20"
                data-testid="user-menu-trigger"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-cyber-blue to-electric-purple text-white">
                    {mockUser.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {mockUser.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-56 glass-card border border-border/50"
              data-testid="user-menu-content"
            >
              <DropdownMenuLabel className="gradient-text">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem data-testid="user-menu-profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem data-testid="user-menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                data-testid="user-menu-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
