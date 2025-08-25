import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useAnimations";
import GlassCard from "@/components/common/GlassCard";
import NeumorphButton from "@/components/common/NeumorphButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatBytes, exportToJSON, exportToCSV } from "@/utils/networkUtils";
import { Download, Activity, Wifi, Upload, Download as DownloadIcon, Pause, Play, RotateCcw } from "lucide-react";

interface BandwidthData {
  timestamp: number;
  download: number;
  upload: number;
  total: number;
}

interface NetworkInterface {
  name: string;
  type: 'ethernet' | 'wifi' | 'cellular';
  status: 'active' | 'inactive';
  totalDownload: number;
  totalUpload: number;
  currentDownload: number;
  currentUpload: number;
}

const BandwidthMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedInterface, setSelectedInterface] = useState<string>("eth0");
  const [monitoringDuration, setMonitoringDuration] = useState<number>(60);
  const [bandwidthData, setBandwidthData] = useState<BandwidthData[]>([]);
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [currentStats, setCurrentStats] = useState<NetworkInterface | null>(null);
  const [maxBandwidth, setMaxBandwidth] = useState<number>(100); // Mbps
  
  const scrollAnimation = useScrollAnimation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Mock network interfaces
  const mockInterfaces: NetworkInterface[] = [
    {
      name: "eth0",
      type: "ethernet",
      status: "active",
      totalDownload: 0,
      totalUpload: 0,
      currentDownload: 0,
      currentUpload: 0
    },
    {
      name: "wlan0",
      type: "wifi",
      status: "active",
      totalDownload: 0,
      totalUpload: 0,
      currentDownload: 0,
      currentUpload: 0
    },
    {
      name: "lo",
      type: "ethernet",
      status: "inactive",
      totalDownload: 0,
      totalUpload: 0,
      currentDownload: 0,
      currentUpload: 0
    }
  ];

  useEffect(() => {
    setInterfaces(mockInterfaces);
    setCurrentStats(mockInterfaces[0]);
  }, []);

  const generateMockData = (): BandwidthData => {
    const now = Date.now();
    const time = (now - startTimeRef.current) / 1000;
    
    // Generate realistic bandwidth patterns
    const baseDownload = 20 + Math.sin(time / 10) * 15 + Math.random() * 10;
    const baseUpload = 5 + Math.sin(time / 15) * 3 + Math.random() * 5;
    
    // Add occasional spikes
    const spike = Math.random() < 0.1 ? Math.random() * 30 : 0;
    
    return {
      timestamp: now,
      download: Math.max(0, baseDownload + spike),
      upload: Math.max(0, baseUpload + spike * 0.3),
      total: baseDownload + baseUpload + spike
    };
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    setBandwidthData([]);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const newData = generateMockData();
      
      setBandwidthData(prev => {
        const updated = [...prev, newData];
        // Keep only last 100 data points for performance
        return updated.slice(-100);
      });

      // Update current interface stats
      setCurrentStats(prev => prev ? {
        ...prev,
        currentDownload: newData.download,
        currentUpload: newData.upload,
        totalDownload: prev.totalDownload + newData.download / 8, // Convert Mbps to MB
        totalUpload: prev.totalUpload + newData.upload / 8
      } : null);

      // Auto-stop after duration
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed >= monitoringDuration) {
        stopMonitoring();
      }
    }, 1000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetMonitoring = () => {
    stopMonitoring();
    setBandwidthData([]);
    setCurrentStats(prev => prev ? {
      ...prev,
      totalDownload: 0,
      totalUpload: 0,
      currentDownload: 0,
      currentUpload: 0
    } : null);
  };

  const exportResults = (format: 'json' | 'csv') => {
    if (bandwidthData.length === 0) return;
    
    const exportData = bandwidthData.map(data => ({
      timestamp: new Date(data.timestamp).toISOString(),
      download_mbps: data.download.toFixed(2),
      upload_mbps: data.upload.toFixed(2),
      total_mbps: data.total.toFixed(2)
    }));
    
    if (format === 'json') {
      exportToJSON({
        interface: selectedInterface,
        duration: monitoringDuration,
        data: exportData,
        summary: {
          avgDownload: bandwidthData.reduce((sum, d) => sum + d.download, 0) / bandwidthData.length,
          avgUpload: bandwidthData.reduce((sum, d) => sum + d.upload, 0) / bandwidthData.length,
          maxDownload: Math.max(...bandwidthData.map(d => d.download)),
          maxUpload: Math.max(...bandwidthData.map(d => d.upload)),
          totalDataTransferred: currentStats ? currentStats.totalDownload + currentStats.totalUpload : 0
        }
      }, 'bandwidth-monitor-results');
    } else {
      exportToCSV(exportData, 'bandwidth-monitor-results');
    }
  };

  const getInterfaceIcon = (type: string) => {
    switch (type) {
      case 'wifi': return Wifi;
      case 'ethernet': return Activity;
      default: return Activity;
    }
  };

  const getCurrentUtilization = () => {
    if (!currentStats) return { download: 0, upload: 0 };
    return {
      download: (currentStats.currentDownload / maxBandwidth) * 100,
      upload: (currentStats.currentUpload / maxBandwidth) * 100
    };
  };

  const utilization = getCurrentUtilization();
  const elapsed = isMonitoring ? (Date.now() - startTimeRef.current) / 1000 : 0;
  const progress = (elapsed / monitoringDuration) * 100;

  return (
    <motion.div
      ref={scrollAnimation.ref}
      variants={scrollAnimation.variants}
      transition={scrollAnimation.transition}
      className="space-y-6"
    >
      {/* Controls */}
      <GlassCard className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold gradient-text mb-2">
              <Activity className="w-5 h-5 inline mr-2" />
              Real-time Bandwidth Monitor
            </h3>
            <p className="text-muted-foreground text-sm">
              Monitor network interface bandwidth usage in real-time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="interface" className="text-sm whitespace-nowrap">Interface:</Label>
              <Select
                value={selectedInterface}
                onValueChange={setSelectedInterface}
                disabled={isMonitoring}
              >
                <SelectTrigger className="w-32 form-input" data-testid="select-interface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border border-border/50">
                  {interfaces.map((iface) => (
                    <SelectItem key={iface.name} value={iface.name}>
                      {iface.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="duration" className="text-sm whitespace-nowrap">Duration:</Label>
              <Select
                value={monitoringDuration.toString()}
                onValueChange={(value) => setMonitoringDuration(parseInt(value))}
                disabled={isMonitoring}
              >
                <SelectTrigger className="w-20 form-input" data-testid="select-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border border-border/50">
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">1m</SelectItem>
                  <SelectItem value="300">5m</SelectItem>
                  <SelectItem value="600">10m</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <NeumorphButton
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                variant={isMonitoring ? "warning" : "success"}
                size="sm"
              >
                {isMonitoring ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </>
                )}
              </NeumorphButton>

              <Button
                onClick={resetMonitoring}
                size="sm"
                variant="ghost"
                disabled={isMonitoring}
                data-testid="reset-monitoring"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isMonitoring && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monitoring Progress</span>
              <span className="text-cyber-blue">
                {Math.floor(elapsed)}s / {monitoringDuration}s
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </motion.div>
        )}
      </GlassCard>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Usage */}
        <GlassCard className="p-6">
          <h4 className="font-semibold mb-4 text-neon-green flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Current Usage
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground flex items-center">
                  <DownloadIcon className="w-3 h-3 mr-1" />
                  Download
                </span>
                <div className="text-right">
                  <div className="font-semibold text-neon-green">
                    {currentStats?.currentDownload.toFixed(1) || '0.0'} Mbps
                  </div>
                </div>
              </div>
              <Progress value={utilization.download} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </span>
                <div className="text-right">
                  <div className="font-semibold text-electric-purple">
                    {currentStats?.currentUpload.toFixed(1) || '0.0'} Mbps
                  </div>
                </div>
              </div>
              <Progress value={utilization.upload} className="h-2" />
            </div>

            <div className="pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Total: {((currentStats?.currentDownload || 0) + (currentStats?.currentUpload || 0)).toFixed(1)} Mbps
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Interface Info */}
        <GlassCard className="p-6">
          <h4 className="font-semibold mb-4 text-cyber-blue flex items-center">
            <Wifi className="w-4 h-4 mr-2" />
            Interface Details
          </h4>

          {currentStats && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const IconComponent = getInterfaceIcon(currentStats.type);
                    return <IconComponent className="w-4 h-4" />;
                  })()}
                  <span className="font-mono">{currentStats.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="secondary">{currentStats.type}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge 
                  variant={currentStats.status === 'active' ? 'secondary' : 'destructive'}
                  className={currentStats.status === 'active' ? 'text-neon-green' : ''}
                >
                  {currentStats.status}
                </Badge>
              </div>

              <div className="pt-2 border-t border-border/50 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Downloaded:</span>
                  <span>{formatBytes(currentStats.totalDownload * 1024 * 1024)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Uploaded:</span>
                  <span>{formatBytes(currentStats.totalUpload * 1024 * 1024)}</span>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Statistics */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-electric-purple">Session Statistics</h4>
            {bandwidthData.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => exportResults('json')}
                  size="sm"
                  variant="ghost"
                  className="text-cyber-blue hover:text-cyber-blue/80"
                  data-testid="export-json"
                >
                  <Download className="w-3 h-3 mr-1" />
                  JSON
                </Button>
                <Button
                  onClick={() => exportResults('csv')}
                  size="sm"
                  variant="ghost"
                  className="text-cyber-blue hover:text-cyber-blue/80"
                  data-testid="export-csv"
                >
                  <Download className="w-3 h-3 mr-1" />
                  CSV
                </Button>
              </div>
            )}
          </div>

          {bandwidthData.length > 0 ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Download:</span>
                <span className="font-mono">
                  {(bandwidthData.reduce((sum, d) => sum + d.download, 0) / bandwidthData.length).toFixed(1)} Mbps
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Upload:</span>
                <span className="font-mono">
                  {(bandwidthData.reduce((sum, d) => sum + d.upload, 0) / bandwidthData.length).toFixed(1)} Mbps
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Download:</span>
                <span className="font-mono text-neon-green">
                  {Math.max(...bandwidthData.map(d => d.download)).toFixed(1)} Mbps
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Upload:</span>
                <span className="font-mono text-electric-purple">
                  {Math.max(...bandwidthData.map(d => d.upload)).toFixed(1)} Mbps
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Data Points:</span>
                <span>{bandwidthData.length}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start monitoring to see statistics</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Real-time Chart */}
      <GlassCard className="p-6">
        <h4 className="font-semibold mb-4 gradient-text">Bandwidth Usage Chart</h4>
        
        <div className="bg-gray-900/50 rounded-lg p-4 h-64">
          {bandwidthData.length > 0 ? (
            <div className="relative h-full">
              {/* Simple line chart representation */}
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="downloadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00ff88', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#00ff88', stopOpacity: 0.1 }} />
                  </linearGradient>
                  <linearGradient id="uploadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.1 }} />
                  </linearGradient>
                </defs>
                
                {/* Chart lines */}
                {bandwidthData.length > 1 && (
                  <>
                    {/* Download line */}
                    <path
                      d={`M ${bandwidthData.map((d, i) => 
                        `${(i / (bandwidthData.length - 1)) * 380 + 10},${190 - (d.download / maxBandwidth) * 180}`
                      ).join(' L ')}`}
                      fill="none"
                      stroke="#00ff88"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                    
                    {/* Upload line */}
                    <path
                      d={`M ${bandwidthData.map((d, i) => 
                        `${(i / (bandwidthData.length - 1)) * 380 + 10},${190 - (d.upload / maxBandwidth) * 180}`
                      ).join(' L ')}`}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  </>
                )}
                
                {/* Data points */}
                {bandwidthData.slice(-20).map((d, i) => {
                  const x = (i / 19) * 380 + 10;
                  const downloadY = 190 - (d.download / maxBandwidth) * 180;
                  const uploadY = 190 - (d.upload / maxBandwidth) * 180;
                  
                  return (
                    <g key={i}>
                      <circle cx={x} cy={downloadY} r="2" fill="#00ff88" opacity="0.8" />
                      <circle cx={x} cy={uploadY} r="2" fill="#8b5cf6" opacity="0.8" />
                    </g>
                  );
                })}
              </svg>
              
              {/* Chart legend */}
              <div className="absolute top-2 right-2 flex space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-neon-green rounded-full mr-1" />
                  <span>Download</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-electric-purple rounded-full mr-1" />
                  <span>Upload</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Start monitoring to see real-time bandwidth chart</p>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default BandwidthMonitor;
