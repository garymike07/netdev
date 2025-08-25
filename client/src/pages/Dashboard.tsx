import { motion } from "framer-motion";
import { useNetworkTools, useDashboardStats, useNetworkEvents } from "@/hooks/useNetworkTools";
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/useAnimations";
import GlassCard from "@/components/common/GlassCard";
import ToolCard from "@/components/tools/ToolCard";
import { formatBytes, getStatusColor, getStatusIcon } from "@/utils/networkUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Clock, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const { data: tools, isLoading: toolsLoading } = useNetworkTools();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: events, isLoading: eventsLoading } = useNetworkEvents(10);
  
  const scrollAnimation = useScrollAnimation();
  const staggerAnimation = useStaggerAnimation(0.1);

  const quickTools = tools?.slice(0, 8) || [];

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: string,
    color: string,
    trend?: { value: number; isPositive: boolean }
  ) => (
    <GlassCard className="p-6 neumorphic hover:shadow-cyber transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`} data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 ${color.replace('text-', 'bg-')}/20 rounded-xl flex items-center justify-center`}>
          <i className={`fas fa-${icon} ${color} text-xl`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4">
          <div className="flex items-center text-sm">
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 text-neon-green mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
            )}
            <span className={trend.isPositive ? "text-neon-green" : "text-red-400"}>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground ml-1">from last week</span>
          </div>
        </div>
      )}
    </GlassCard>
  );

  if (statsLoading || toolsLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 rounded-xl animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-700 rounded mb-4"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={scrollAnimation.ref}
      variants={staggerAnimation.container}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Network Health Overview */}
      <motion.div variants={staggerAnimation.item}>
        <h3 className="text-xl font-semibold mb-6 gradient-text">Network Health Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderStatCard(
            "Network Uptime",
            `${stats?.networkUptime || 99.8}%`,
            "heartbeat",
            "text-neon-green",
            { value: 0.2, isPositive: true }
          )}
          {renderStatCard(
            "Active Devices", 
            stats?.activeDevices || 247,
            "desktop",
            "text-cyber-blue",
            { value: 12, isPositive: true }
          )}
          {renderStatCard(
            "Bandwidth Usage",
            formatBytes((stats?.bandwidthUsage || 847) * 1024 * 1024 * 1024),
            "wifi",
            "text-electric-purple",
            { value: 5, isPositive: false }
          )}
          {renderStatCard(
            "Security Alerts",
            stats?.securityAlerts || 3,
            "exclamation-triangle", 
            "text-red-400"
          )}
        </div>
      </motion.div>

      {/* Quick Access Tools */}
      <motion.div variants={staggerAnimation.item}>
        <h3 className="text-xl font-semibold mb-6 gradient-text">Quick Access Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              variants={staggerAnimation.item}
              custom={index}
            >
              <ToolCard tool={tool} index={index} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Network Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Traffic Chart */}
        <motion.div variants={staggerAnimation.item}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Network Traffic</h3>
            <div className="relative">
              <div className="h-64 bg-gray-800/30 rounded-lg flex items-end justify-center p-4">
                <div className="flex items-end space-x-2 h-full w-full">
                  {[60, 80, 45, 90, 75, 55, 85].map((height, index) => (
                    <motion.div
                      key={index}
                      className="bg-gradient-to-t from-cyber-blue to-cyber-blue/50 w-full rounded-t"
                      style={{ height: `${height}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      data-testid={`traffic-bar-${index}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Network Events */}
        <motion.div variants={staggerAnimation.item}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold gradient-text">Recent Network Events</h3>
              <Button variant="ghost" size="sm" className="text-cyber-blue hover:text-cyber-blue/80">
                View All
              </Button>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : events && events.length > 0 ? (
                events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0"
                    data-testid={`event-${event.id}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${getStatusColor(event.severity).replace('text-', 'bg-')}`} />
                      <div>
                        <p className="font-medium text-sm">{event.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.source && `Source: ${event.source}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={event.severity === 'error' ? 'destructive' : 'secondary'}>
                        {event.severity}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>
                          {event.createdAt ? new Date(event.createdAt).toLocaleTimeString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent network events</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
