import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  glowOnHover?: boolean;
}

const GlassCard = ({ 
  children, 
  className, 
  onClick, 
  hoverable = false,
  glowOnHover = false
}: GlassCardProps) => {
  const cardVariants = {
    rest: { 
      scale: 1,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
    },
    hover: { 
      scale: hoverable ? 1.02 : 1,
      y: hoverable ? -5 : 0,
      boxShadow: glowOnHover 
        ? "0 20px 40px rgba(0, 212, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
        : "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: hoverable ? { 
      scale: 0.98,
      y: 0,
      transition: { duration: 0.1 }
    } : {}
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={cn(
        "glass-card rounded-xl backdrop-blur-md border border-white/20",
        "bg-gradient-to-br from-card/40 to-card/20",
        hoverable && "cursor-pointer",
        className
      )}
      onClick={onClick}
      data-testid={onClick ? "card-interactive" : "card-static"}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
