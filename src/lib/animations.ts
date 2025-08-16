import { Variants } from 'framer-motion';

// Fade animations
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { duration: 0.3 } 
  }
};

export const fadeInDownVariants: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    transition: { duration: 0.3 } 
  }
};

export const fadeInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    x: -30, 
    transition: { duration: 0.3 } 
  }
};

export const fadeInRightVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    x: 30, 
    transition: { duration: 0.3 } 
  }
};

// Scale animations
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.1, 0.25, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    transition: { duration: 0.3 } 
  }
};

export const scaleUpVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.4, 
      ease: [0.34, 1.56, 0.64, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.5, 
    transition: { duration: 0.2 } 
  }
};

// Slide animations
export const slideUpVariants: Variants = {
  hidden: { y: '100%' },
  visible: { 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.1, 0.25, 1] 
    } 
  },
  exit: { 
    y: '100%', 
    transition: { duration: 0.3 } 
  }
};

export const slideDownVariants: Variants = {
  hidden: { y: '-100%' },
  visible: { 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.1, 0.25, 1] 
    } 
  },
  exit: { 
    y: '-100%', 
    transition: { duration: 0.3 } 
  }
};

export const slideLeftVariants: Variants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.1, 0.25, 1] 
    } 
  },
  exit: { 
    x: '100%', 
    transition: { duration: 0.3 } 
  }
};

export const slideRightVariants: Variants = {
  hidden: { x: '-100%' },
  visible: { 
    x: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.1, 0.25, 1] 
    } 
  },
  exit: { 
    x: '-100%', 
    transition: { duration: 0.3 } 
  }
};

// Stagger animations for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Card hover animations
export const cardHoverVariants: Variants = {
  rest: { 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  hover: { 
    scale: 1.05, 
    y: -5,
    transition: { duration: 0.3, ease: 'easeInOut' }
  }
};

export const cardTapVariants: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.95 }
};

// Button animations
export const buttonHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

// Pulse animation for attention
export const pulseVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Loading animation
export const loadingVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// Page transition animations
export const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeInOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

// Modal animations
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const modalContentVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: 20,
    transition: { duration: 0.2 }
  }
};

// Drawer animations
export const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0,
    transition: { 
      type: 'spring',
      damping: 25,
      stiffness: 200
    }
  },
  exit: { 
    x: '100%',
    transition: { duration: 0.3 }
  }
};

// Tab animations
export const tabVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2 }
  }
};

// Progress bar animation
export const progressVariants: Variants = {
  initial: { width: 0 },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: { duration: 0.8, ease: 'easeOut' }
  })
};

// Notification animations
export const notificationVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: 400,
    scale: 0.8
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: { 
      type: 'spring',
      damping: 25,
      stiffness: 200
    }
  },
  exit: { 
    opacity: 0, 
    x: 400,
    scale: 0.8,
    transition: { duration: 0.3 }
  }
};

// Tooltip animations
export const tooltipVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 10
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: 10,
    transition: { duration: 0.1 }
  }
};

// Dropdown animations
export const dropdownVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: -10
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: -10,
    transition: { duration: 0.1 }
  }
};

// Breadcrumb animations
export const breadcrumbVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
};

// Skeleton loading animation
export const skeletonVariants: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Form field animations
export const formFieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  focus: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

// Chart animations
export const chartVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Image gallery animations
export const galleryItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 }
  }
};

// Navigation animations
export const navItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  },
  hover: {
    x: 5,
    transition: { duration: 0.2 }
  }
};

// Search animations
export const searchVariants: Variants = {
  hidden: { opacity: 0, width: 0 },
  visible: { 
    opacity: 1, 
    width: 'auto',
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    width: 0,
    transition: { duration: 0.2 }
  }
};

// Accordion animations
export const accordionVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { 
    height: 'auto',
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: 'easeInOut'
    }
  },
  exit: { 
    height: 0,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Pagination animations
export const paginationVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.1,
    transition: { duration: 0.1 }
  }
};

// Utility function to create staggered animations
export const createStaggerAnimation = (staggerDelay: number = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay
    }
  }
});

// Utility function to create slide animations
export const createSlideAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
  const directions = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 }
  };

  return {
    hidden: { opacity: 0, ...directions[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };
};

// Spring animation configurations
export const springConfig = {
  type: 'spring',
  damping: 25,
  stiffness: 200
};

// Easing functions
export const easing = {
  easeInOut: [0.25, 0.1, 0.25, 1],
  easeOut: [0.25, 0.46, 0.45, 0.94],
  easeIn: [0.55, 0.055, 0.675, 0.19],
  bounce: [0.68, -0.6, 0.32, 1.6]
};