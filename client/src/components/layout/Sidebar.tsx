import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: string;
  badge?: number;
}

interface NavGroup {
  name: string;
  icon: string;
  items: NavItem[];
}

const Sidebar = ({ collapsed, onToggle, isMobile = false, isOpen = false, onClose }: SidebarProps) => {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Discovery"]);

  const navGroups: NavGroup[] = [
    {
      name: "Discovery",
      icon: "radar-chart",
      items: [
        { name: "Network Scanner", path: "/network-scanner", icon: "search" },
        { name: "Port Scanner", path: "/port-scanner", icon: "door-open" },
        { name: "Ping Tool", path: "/ping", icon: "satellite-dish" },
        { name: "Traceroute", path: "/traceroute", icon: "route" },
      ]
    },
    {
      name: "DNS Tools", 
      icon: "globe",
      items: [
        { name: "DNS Lookup", path: "/dns-lookup", icon: "search-location" },
        { name: "Whois Lookup", path: "/whois-lookup", icon: "info-circle" },
        { name: "DNS Propagation", path: "/dns-propagation", icon: "sync" },
      ]
    },
    {
      name: "Security",
      icon: "shield-alt", 
      items: [
        { name: "SSL Analyzer", path: "/ssl-analyzer", icon: "lock" },
        { name: "Vulnerability Scanner", path: "/vulnerability-scanner", icon: "bug" },
        { name: "Header Analyzer", path: "/header-analyzer", icon: "file-alt" },
      ]
    },
    {
      name: "Monitoring",
      icon: "chart-line",
      items: [
        { name: "Bandwidth Monitor", path: "/bandwidth-monitor", icon: "tachometer-alt" },
        { name: "Network Topology", path: "/network-topology", icon: "project-diagram" },
        { name: "Latency Monitor", path: "/latency-monitor", icon: "clock" },
      ]
    },
    {
      name: "Utilities", 
      icon: "tools",
      items: [
        { name: "Subnet Calculator", path: "/subnet-calculator", icon: "calculator" },
        { name: "Speed Test", path: "/speed-test", icon: "gauge" },
        { name: "MAC Lookup", path: "/mac-lookup", icon: "id-card" },
      ]
    }
  ];

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "4rem" }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 }
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <motion.div
        variants={sidebarVariants}
        animate={isMobile ? undefined : (collapsed ? "collapsed" : "expanded")}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 glass-card border-r border-border/50",
          isMobile ? "w-64 transform transition-transform duration-300" : "",
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        )}
        role={isMobile ? "dialog" : undefined}
        aria-modal={isMobile ? true : undefined}
      >
        <div className="h-full p-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyber-blue to-electric-purple flex items-center justify-center flex-shrink-0">
              <i className="fas fa-network-wired text-white text-lg" />
            </div>
            
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  transition={{ duration: 0.2 }}
                  className="ml-3"
                >
                  <h1 className="text-xl font-bold gradient-text whitespace-nowrap">
                    Mike dev tools
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Button */}
          <Button
            onClick={onToggle}
            size="sm"
            variant="ghost"
            className={cn("mb-4 self-start p-2", isMobile && "hidden")}
            data-testid="sidebar-toggle"
          >
            <i className={cn(
              "fas transition-transform duration-300",
              collapsed ? "fa-chevron-right" : "fa-chevron-left"
            )} />
          </Button>

          {/* Search */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                transition={{ duration: 0.2 }}
                className="mb-6"
              >
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 form-input"
                    data-testid="sidebar-search"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {/* Dashboard Link */}
            <motion.div
              whileHover={{ scale: collapsed ? 1.1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => { navigate("/"); if (isMobile) onClose?.(); }}
                className={cn(
                  "w-full flex items-center px-3 py-2 rounded-lg transition-colors",
                  "text-left",
                  location === "/" 
                    ? "bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30"
                    : "hover:bg-glass-white/20 text-muted-foreground hover:text-foreground"
                )}
                data-testid="nav-dashboard"
              >
                <i className="fas fa-tachometer-alt flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      transition={{ duration: 0.2 }}
                      className="ml-3 whitespace-nowrap"
                    >
                      Dashboard
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>

            {/* Navigation Groups */}
            {filteredGroups.map((group) => (
              <div key={group.name} className="nav-group">
                {!collapsed ? (
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-glass-white/20 transition-colors text-left"
                    data-testid={`nav-group-${group.name}`}
                  >
                    <span className="flex items-center">
                      <i className={`fas fa-${group.icon} mr-3`} />
                      {group.name}
                    </span>
                    <motion.i
                      className="fas fa-chevron-down text-sm"
                      animate={{ 
                        rotate: expandedGroups.includes(group.name) ? 180 : 0 
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </button>
                ) : (
                  <div className="px-3 py-2">
                    <i className={`fas fa-${group.icon} text-muted-foreground`} />
                  </div>
                )}

                <AnimatePresence>
                  {(expandedGroups.includes(group.name) || collapsed) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={cn(
                        "space-y-1 mt-1",
                        !collapsed && "ml-6"
                      )}>
                        {group.items.map((item) => (
                          <motion.div
                            key={item.path}
                            whileHover={{ scale: collapsed ? 1.1 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <button
                              onClick={() => { navigate(item.path); if (isMobile) onClose?.(); }}
                              className={cn(
                                "w-full flex items-center px-3 py-2 rounded text-sm transition-colors text-left",
                                location === item.path
                                  ? "bg-primary/20 text-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-glass-white/20"
                              )}
                              title={collapsed ? item.name : undefined}
                              data-testid={`nav-item-${item.name}`}
                            >
                              <i className={`fas fa-${item.icon} flex-shrink-0`} />
                              <AnimatePresence>
                                {!collapsed && (
                                  <motion.span
                                    variants={contentVariants}
                                    initial="collapsed"
                                    animate="expanded"
                                    exit="collapsed"
                                    transition={{ duration: 0.2 }}
                                    className="ml-3 whitespace-nowrap"
                                  >
                                    {item.name}
                                  </motion.span>
                                )}
                              </AnimatePresence>
                              {item.badge && !collapsed && (
                                <Badge 
                                  variant="destructive" 
                                  className="ml-auto text-xs"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;