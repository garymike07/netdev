import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface NeumorphButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "cyber" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const NeumorphButton = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className,
  type = "button"
}: NeumorphButtonProps) => {
  const buttonVariants = {
    rest: {
      scale: 1,
      boxShadow: "8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(42, 42, 42, 0.1)"
    },
    hover: {
      scale: disabled ? 1 : 1.05,
      boxShadow: disabled 
        ? "8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(42, 42, 42, 0.1)"
        : "12px 12px 20px rgba(0, 0, 0, 0.5), -12px -12px 20px rgba(42, 42, 42, 0.15)",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: disabled ? 1 : 0.95,
      boxShadow: disabled 
        ? "8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(42, 42, 42, 0.1)"
        : "inset 8px 8px 16px rgba(0, 0, 0, 0.4), inset -8px -8px 16px rgba(42, 42, 42, 0.1)",
      transition: { duration: 0.1 }
    }
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-cyber-blue to-electric-purple text-white",
    secondary: "bg-gradient-to-r from-light-charcoal to-medium-charcoal text-foreground",
    cyber: "bg-gradient-to-r from-cyber-blue to-neon-green text-black font-bold",
    success: "bg-gradient-to-r from-neon-green to-emerald-500 text-black",
    warning: "bg-gradient-to-r from-yellow-500 to-orange-500 text-black",
    error: "bg-gradient-to-r from-red-500 to-pink-500 text-white"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.div
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="inline-block"
    >
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        type={type}
        className={cn(
          "relative overflow-hidden border-0 font-semibold rounded-lg",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        data-testid={`button-${variant}`}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
        
        <div className={cn("relative z-10", loading && "opacity-0")}>
          {children}
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transition-transform duration-700 group-hover:translate-x-full" />
      </Button>
    </motion.div>
  );
};

export default NeumorphButton;
