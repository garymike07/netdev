import { useInView } from "framer-motion";
import { useRef } from "react";

export function useScrollAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return {
    ref,
    isInView,
    variants: {
      initial: { opacity: 0, y: 50 },
      animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 },
    },
    transition: { duration: 0.5, ease: "easeOut" }
  };
}

export function useStaggerAnimation(delay: number = 0.1) {
  return {
    container: {
      animate: {
        transition: {
          staggerChildren: delay
        }
      }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    }
  };
}

export function useCardAnimation() {
  return {
    whileHover: {
      y: -8,
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    whileTap: {
      y: 0,
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };
}

export function useButtonAnimation() {
  return {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };
}

export function useLoadingAnimation() {
  return {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };
}

export function usePulseAnimation(duration: number = 2) {
  return {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
}

export function useGlowAnimation() {
  return {
    animate: {
      textShadow: [
        "0 0 20px rgb(0, 212, 255)",
        "0 0 30px rgb(0, 212, 255), 0 0 40px rgb(0, 212, 255)",
        "0 0 20px rgb(0, 212, 255)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
}

export function useSlideAnimation(direction: 'left' | 'right' | 'up' | 'down' = 'up') {
  const directions = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: -20 },
    down: { x: 0, y: 20 }
  };

  return {
    initial: { opacity: 0, ...directions[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...directions[direction] },
    transition: { duration: 0.3, ease: "easeOut" }
  };
}

export function useProgressAnimation(progress: number) {
  return {
    initial: { width: "0%" },
    animate: { width: `${progress}%` },
    transition: { duration: 0.8, ease: "easeOut" }
  };
}

export function useTypewriterAnimation(text: string) {
  return {
    animate: {
      width: ["0%", "100%"],
      transition: {
        duration: text.length * 0.05,
        ease: "steps(10, end)"
      }
    }
  };
}
