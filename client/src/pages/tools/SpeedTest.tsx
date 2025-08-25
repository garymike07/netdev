import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSpeedTest } from "@/hooks/useNetworkTools";
import { useScrollAnimation } from "@/hooks/useAnimations";
import GlassCard from "@/components/common/GlassCard";
import NeumorphButton from "@/components/common/NeumorphButton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { exportToJSON } from "@/utils/networkUtils";
import { Download, Gauge, Wifi, Upload, Download as DownloadIcon, Clock } from "lucide-react";

const SpeedTest = () => {
  const [testResults, setTestResults] = useState<{
    download: number;
    upload: number;
    ping: number;
    jitter: number;
    server: string;
    timestamp: string;
  } | null>(null);
  
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'ping' | 'download' | 'upload' | 'complete'>('idle');
  
  const scrollAnimation = useScrollAnimation();
  const speedTestMutation = useSpeedTest();

  const runSpeedTest = async () => {
    setTestResults(null);
    setProgress(0);
    setCurrentPhase('ping');
    
    // Simulate test phases with progress updates
    const phases = [
      { phase: 'ping', duration: 2000, label: 'Testing ping...' },
      { phase: 'download', duration: 8000, label: 'Testing download speed...' },
      { phase: 'upload', duration: 5000, label: 'Testing upload speed...' },
    ];
    
    let totalProgress = 0;
    const progressIncrement = 100 / phases.length;
    
    for (const phase of phases) {
      setCurrentPhase(phase.phase as any);
      
      // Animate progress for this phase
      const startProgress = totalProgress;
      const endProgress = totalProgress + progressIncrement;
      const progressDuration = phase.duration;
      const steps = 50;
      const stepDuration = progressDuration / steps;
      
      for (let i = 0; i <= steps; i++) {
        const currentProgress = startProgress + (endProgress - startProgress) * (i / steps);
        setProgress(currentProgress);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
      
      totalProgress = endProgress;
    }
    
    try {
      const result = await speedTestMutation.mutateAsync();
      setTestResults(result.results);
      setCurrentPhase('complete');
      setProgress(100);
    } catch (error) {
      console.error("Speed test failed:", error);
      setCurrentPhase('idle');
      setProgress(0);
    }
  };

  const exportResults = () => {
    if (!testResults) return;
    exportToJSON(testResults, 'speed-test-results');
  };

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case 'ping': return 'Testing latency...';
      case 'download': return 'Measuring download speed...';
      case 'upload': return 'Measuring upload speed...';
      case 'complete': return 'Test completed!';
      default: return '';
    }
  };

  const getSpeedGrade = (downloadSpeed: number) => {
    if (downloadSpeed >= 100) return { grade: 'A+', color: 'text-neon-green' };
    if (downloadSpeed >= 50) return { grade: 'A', color: 'text-neon-green' };
    if (downloadSpeed >= 25) return { grade: 'B', color: 'text-yellow-500' };
    if (downloadSpeed >= 10) return { grade: 'C', color: 'text-orange-500' };
    return { grade: 'D', color: 'text-red-400' };
  };

  return (
    <motion.div
      ref={scrollAnimation.ref}
      variants={scrollAnimation.variants}
      transition={scrollAnimation.transition}
      className="space-y-6"
    >
      {/* Main Speed Test Interface */}
      <GlassCard className="p-8 text-center">
        <div className="mb-8">
          <h3 className="text-2xl font-bold gradient-text mb-2">Internet Speed Test</h3>
          <p className="text-muted-foreground">
            Measure your internet connection speed and latency
          </p>
        </div>

        {/* Speedometer Display */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <motion.div
              className="w-full h-full bg-gradient-to-r from-cyber-blue to-electric-purple rounded-full flex items-center justify-center relative"
              animate={speedTestMutation.isPending ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-28 h-28 bg-gray-900 rounded-full flex flex-col items-center justify-center">
                <span 
                  className="text-2xl font-bold text-white"
                  data-testid="speed-display"
                >
                  {testResults ? testResults.download : '--'}
                </span>
                <span className="text-xs text-gray-400">Mbps</span>
              </div>
              
              {speedTestMutation.isPending && (
                <motion.div
                  className="absolute inset-0 rounded-full border-t-4 border-cyber-blue opacity-60"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          </div>
          
          {testResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center space-x-2"
            >
              <Badge variant="secondary" className={getSpeedGrade(testResults.download).color}>
                Grade: {getSpeedGrade(testResults.download).grade}
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Speed Metrics */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DownloadIcon className="w-5 h-5 text-neon-green mr-2" />
              <span className="text-sm text-muted-foreground">Download</span>
            </div>
            <div 
              className="text-2xl font-bold text-neon-green"
              data-testid="download-speed"
            >
              {testResults ? `${testResults.download} Mbps` : '--'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Upload className="w-5 h-5 text-electric-purple mr-2" />
              <span className="text-sm text-muted-foreground">Upload</span>
            </div>
            <div 
              className="text-2xl font-bold text-electric-purple"
              data-testid="upload-speed"
            >
              {testResults ? `${testResults.upload} Mbps` : '--'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-cyber-blue mr-2" />
              <span className="text-sm text-muted-foreground">Ping</span>
            </div>
            <div 
              className="text-2xl font-bold text-cyber-blue"
              data-testid="ping-latency"
            >
              {testResults ? `${testResults.ping} ms` : '--'}
            </div>
          </div>
        </div>

        {/* Control Button */}
        <NeumorphButton
          onClick={runSpeedTest}
          variant="warning"
          size="lg"
          loading={speedTestMutation.isPending}
          disabled={speedTestMutation.isPending}
          className="mb-6"
        >
          {speedTestMutation.isPending ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <Gauge className="w-5 h-5" />
              </motion.div>
              Running Test...
            </>
          ) : (
            <>
              <Gauge className="w-5 h-5 mr-2" />
              Start Speed Test
            </>
          )}
        </NeumorphButton>

        {/* Progress Bar */}
        {speedTestMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
            data-testid="speed-test-progress"
          >
            <Progress 
              value={progress} 
              className="w-full h-2 progress-bar"
            />
            <p className="text-sm text-muted-foreground">
              {getPhaseLabel()}
            </p>
          </motion.div>
        )}

        {speedTestMutation.error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
          >
            Error: {speedTestMutation.error.message}
          </motion.div>
        )}
      </GlassCard>

      {/* Detailed Results */}
      {testResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold gradient-text">Test Results</h3>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="font-semibold mb-3 text-neon-green">Connection Quality</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Download Speed:</span>
                      <span className="font-mono">{testResults.download} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Upload Speed:</span>
                      <span className="font-mono">{testResults.upload} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latency:</span>
                      <span className="font-mono">{testResults.ping} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jitter:</span>
                      <span className="font-mono">{testResults.jitter} ms</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h4 className="font-semibold mb-3 text-cyber-blue">Test Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Test Server:</span>
                      <span className="font-mono">{testResults.server}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Test Time:</span>
                      <span className="font-mono">
                        {new Date(testResults.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connection Grade:</span>
                      <Badge variant="secondary" className={getSpeedGrade(testResults.download).color}>
                        {getSpeedGrade(testResults.download).grade}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SpeedTest;
