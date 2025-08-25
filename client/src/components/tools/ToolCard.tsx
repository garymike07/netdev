import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import GlassCard from "@/components/common/GlassCard";
import type { NetworkTool } from "@/types/network";

interface ToolCardProps {
  tool: NetworkTool;
  index?: number;
}

const ToolCard = ({ tool, index = 0 }: ToolCardProps) => {
  const [, navigate] = useLocation();
  
  const iconColors = {
    discovery: "text-cyber-blue",
    dns: "text-neon-green", 
    security: "text-green-500",
    monitoring: "text-electric-purple",
    tools: "text-yellow-500"
  };

  const backgroundColors = {
    discovery: "bg-cyber-blue/20",
    dns: "bg-neon-green/20",
    security: "bg-green-500/20", 
    monitoring: "bg-electric-purple/20",
    tools: "bg-yellow-500/20"
  };

  const getToolPath = (name: string): string => {
    return `/${name.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      <GlassCard
        hoverable
        glowOnHover
        className="p-4 h-full flex flex-col transition-all duration-300"
        onClick={() => navigate(getToolPath(tool.name))}
      >
        <div className="flex items-start mb-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center mr-3 flex-shrink-0",
            backgroundColors[tool.category as keyof typeof backgroundColors] || backgroundColors.tools
          )}>
            <i className={cn(
              `fas fa-${tool.icon || 'cog'} text-xl`,
              iconColors[tool.category as keyof typeof iconColors] || iconColors.tools
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1 truncate" data-testid={`tool-name-${tool.name}`}>
              {tool.name}
            </h4>
            <span className={cn(
              "inline-block px-2 py-1 rounded-md text-xs font-medium capitalize",
              backgroundColors[tool.category as keyof typeof backgroundColors] || backgroundColors.tools,
              iconColors[tool.category as keyof typeof iconColors] || iconColors.tools
            )}>
              {tool.category}
            </span>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm flex-1" data-testid={`tool-description-${tool.name}`}>
          {tool.description}
        </p>
        
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <div className={cn(
                "w-2 h-2 rounded-full mr-2",
                tool.enabled ? "bg-neon-green" : "bg-gray-500"
              )} />
              <span>{tool.enabled ? "Available" : "Disabled"}</span>
            </div>
            <motion.div 
              className="text-cyber-blue"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              <i className="fas fa-arrow-right" />
            </motion.div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ToolCard;
