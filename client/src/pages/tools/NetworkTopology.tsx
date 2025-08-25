import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useAnimations";
import GlassCard from "@/components/common/GlassCard";
import NeumorphButton from "@/components/common/NeumorphButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exportToJSON } from "@/utils/networkUtils";
import { Download, RefreshCw, Network, Router, Server, Monitor, Printer, Wifi } from "lucide-react";
import type { NetworkDevice, NetworkConnection } from "@/types/network";

const NetworkTopology = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  
  const scrollAnimation = useScrollAnimation();

  // Mock network topology data
  const mockDevices: NetworkDevice[] = [
    {
      id: "router-1",
      name: "Main Router",
      type: "router",
      ip: "192.168.1.1",
      status: "online",
      connections: ["switch-1", "switch-2"],
      position: { x: 400, y: 50 }
    },
    {
      id: "switch-1",
      name: "Switch A",
      type: "switch",
      ip: "192.168.1.2",
      status: "online",
      connections: ["pc-1", "pc-2"],
      position: { x: 200, y: 150 }
    },
    {
      id: "switch-2",
      name: "Switch B",
      type: "switch",
      ip: "192.168.1.3",
      status: "online",
      connections: ["server-1", "printer-1"],
      position: { x: 600, y: 150 }
    },
    {
      id: "pc-1",
      name: "Workstation 01",
      type: "pc",
      ip: "192.168.1.101",
      status: "online",
      connections: [],
      position: { x: 100, y: 250 }
    },
    {
      id: "pc-2",
      name: "Workstation 02",
      type: "pc",
      ip: "192.168.1.102",
      status: "online",
      connections: [],
      position: { x: 300, y: 250 }
    },
    {
      id: "server-1",
      name: "File Server",
      type: "server",
      ip: "192.168.1.10",
      status: "online",
      connections: [],
      position: { x: 500, y: 250 }
    },
    {
      id: "printer-1",
      name: "Network Printer",
      type: "printer",
      ip: "192.168.1.50",
      status: "online",
      connections: [],
      position: { x: 700, y: 250 }
    },
  ];

  const mockConnections: NetworkConnection[] = [
    { id: "conn-1", from: "router-1", to: "switch-1", type: "ethernet", status: "active" },
    { id: "conn-2", from: "router-1", to: "switch-2", type: "ethernet", status: "active" },
    { id: "conn-3", from: "switch-1", to: "pc-1", type: "ethernet", status: "active" },
    { id: "conn-4", from: "switch-1", to: "pc-2", type: "ethernet", status: "active" },
    { id: "conn-5", from: "switch-2", to: "server-1", type: "ethernet", status: "active" },
    { id: "conn-6", from: "switch-2", to: "printer-1", type: "ethernet", status: "active" },
  ];

  const refreshTopology = async () => {
    setIsScanning(true);
    
    // Simulate network discovery
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDevices(mockDevices);
    setConnections(mockConnections);
    setIsScanning(false);
  };

  const exportTopology = () => {
    const topologyData = { devices, connections, timestamp: new Date().toISOString() };
    exportToJSON(topologyData, 'network-topology');
  };

  const getDeviceIcon = (type: NetworkDevice['type']) => {
    switch (type) {
      case 'router': return Router;
      case 'switch': return Network;
      case 'server': return Server;
      case 'pc': return Monitor;
      case 'printer': return Printer;
      case 'ap': return Wifi;
      default: return Network;
    }
  };

  const getDeviceColor = (status: NetworkDevice['status']) => {
    switch (status) {
      case 'online': return 'text-neon-green bg-neon-green/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/20';
      case 'offline': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  useEffect(() => {
    refreshTopology();
  }, []);

  return (
    <motion.div
      ref={scrollAnimation.ref}
      variants={scrollAnimation.variants}
      transition={scrollAnimation.transition}
      className="space-y-6"
    >
      {/* Controls */}
      <GlassCard className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold gradient-text">Network Topology Visualization</h3>
            <p className="text-muted-foreground text-sm">
              Interactive network map showing device connections and status
            </p>
          </div>
          <div className="flex space-x-2">
            <NeumorphButton
              onClick={refreshTopology}
              variant="primary"
              size="sm"
              loading={isScanning}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </NeumorphButton>
            
            <Button
              onClick={exportTopology}
              size="sm"
              variant="ghost"
              className="text-cyber-blue hover:text-cyber-blue/80"
              disabled={devices.length === 0}
              data-testid="export-topology"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Network Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Network Map</h3>
            
            <div className="bg-gray-900/50 rounded-lg p-8 min-h-96 relative overflow-hidden">
              {isScanning ? (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-cyber-blue"
                  >
                    <Network className="w-8 h-8" />
                  </motion.div>
                  <span className="ml-3 text-muted-foreground">
                    Discovering network devices...
                  </span>
                </div>
              ) : (
                <svg className="w-full h-96" viewBox="0 0 800 300">
                  {/* Connection Lines */}
                  <defs>
                    <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: '#00d4ff', stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.8 }} />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {connections.map((connection) => {
                    const fromDevice = devices.find(d => d.id === connection.from);
                    const toDevice = devices.find(d => d.id === connection.to);
                    
                    if (!fromDevice || !toDevice) return null;
                    
                    return (
                      <motion.line
                        key={connection.id}
                        x1={fromDevice.position.x}
                        y1={fromDevice.position.y}
                        x2={toDevice.position.x}
                        y2={toDevice.position.y}
                        stroke="url(#connectionGradient)"
                        strokeWidth="2"
                        opacity="0.7"
                        filter="url(#glow)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        data-testid={`connection-${connection.id}`}
                      >
                        <motion.animate
                          attributeName="stroke-dashoffset"
                          values={[0, -20]}
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </motion.line>
                    );
                  })}

                  {/* Network Devices */}
                  {devices.map((device, index) => {
                    const IconComponent = getDeviceIcon(device.type);
                    
                    return (
                      <motion.g
                        key={device.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedDevice(device)}
                        data-testid={`device-${device.id}`}
                      >
                        <circle
                          cx={device.position.x}
                          cy={device.position.y}
                          r={device.type === 'router' ? 25 : device.type === 'switch' ? 20 : 15}
                          fill={device.status === 'online' ? '#00d4ff' : '#ff4444'}
                          opacity="0.8"
                          filter="url(#glow)"
                        />
                        
                        <text
                          x={device.position.x}
                          y={device.position.y + 35}
                          textAnchor="middle"
                          fill="#e5e5e5"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {device.name}
                        </text>
                        
                        <text
                          x={device.position.x}
                          y={device.position.y + 50}
                          textAnchor="middle"
                          fill="#a5a5a5"
                          fontSize="10"
                        >
                          {device.ip}
                        </text>

                        {/* Status indicator */}
                        {device.status === 'online' && (
                          <motion.circle
                            cx={device.position.x + 15}
                            cy={device.position.y - 15}
                            r="3"
                            fill="#00ff88"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.g>
                    );
                  })}
                  
                  {/* Data flow animation */}
                  {connections.slice(0, 2).map((connection, index) => {
                    const fromDevice = devices.find(d => d.id === connection.from);
                    const toDevice = devices.find(d => d.id === connection.to);
                    
                    if (!fromDevice || !toDevice) return null;
                    
                    return (
                      <motion.circle
                        key={`flow-${connection.id}`}
                        r="3"
                        fill="#00d4ff"
                        opacity="0.8"
                        initial={{ 
                          cx: fromDevice.position.x, 
                          cy: fromDevice.position.y 
                        }}
                        animate={{
                          cx: [fromDevice.position.x, toDevice.position.x, fromDevice.position.x],
                          cy: [fromDevice.position.y, toDevice.position.y, fromDevice.position.y],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 1.5,
                          ease: "linear"
                        }}
                      />
                    );
                  })}
                </svg>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Device Information Panel */}
        <div className="space-y-4">
          <GlassCard className="p-4">
            <h4 className="font-semibold mb-3 text-cyber-blue">Network Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Devices:</span>
                <span data-testid="total-devices">{devices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Connections:</span>
                <span data-testid="active-connections">{connections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Health:</span>
                <Badge variant="secondary" className="text-neon-green">
                  Excellent
                </Badge>
              </div>
            </div>
          </GlassCard>

          {selectedDevice ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-electric-purple">Device Details</h4>
                  <Button
                    onClick={() => setSelectedDevice(null)}
                    size="sm"
                    variant="ghost"
                    className="p-1"
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getDeviceColor(selectedDevice.status)}`}>
                      {(() => {
                        const IconComponent = getDeviceIcon(selectedDevice.type);
                        return <IconComponent className="w-4 h-4" />;
                      })()}
                    </div>
                    <div>
                      <div className="font-medium" data-testid="selected-device-name">
                        {selectedDevice.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedDevice.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IP Address:</span>
                      <span className="font-mono">{selectedDevice.ip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge 
                        variant={selectedDevice.status === 'online' ? 'secondary' : 'destructive'}
                        className={selectedDevice.status === 'online' ? 'text-neon-green' : ''}
                      >
                        {selectedDevice.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connections:</span>
                      <span>{selectedDevice.connections.length}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <GlassCard className="p-4">
              <div className="text-center text-muted-foreground">
                <Network className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click on a device to view details</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NetworkTopology;
