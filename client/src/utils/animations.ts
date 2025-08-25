export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3 }
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.1 },
  transition: { duration: 0.3 }
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: { opacity: 0, scale: 0.8 }
};

export const rotateIn = {
  initial: { opacity: 0, rotate: -180 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 180 },
  transition: { duration: 0.5 }
};

export const pulseScale = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const glowPulse = {
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

export const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const typewriterEffect = (text: string, delay: number = 50) => ({
  animate: {
    width: ["0%", "100%"],
    transition: {
      duration: (text.length * delay) / 1000,
      ease: "easeInOut"
    }
  }
});

export const progressBarAnimation = (progress: number) => ({
  initial: { width: "0%" },
  animate: { width: `${progress}%` },
  transition: { duration: 0.5, ease: "easeOut" }
});

export const cardHover = {
  whileHover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.3 }
  },
  whileTap: {
    y: 0,
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

export const buttonPress = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 17 }
};

export const morphTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

export const networkPulse = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const dataFlow = {
  animate: {
    strokeDashoffset: [0, -20],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }
  }
};
