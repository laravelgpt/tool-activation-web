'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { pageTransition } from '@/lib/animations';

interface AnimatedPageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedPageWrapper({ children, className = '' }: AnimatedPageWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Layout animation wrapper
export function AnimatedLayout({ children, className = '' }: AnimatedPageWrapperProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

// Staggered children wrapper
export function StaggeredChildren({ 
  children, 
  className = '', 
  staggerDelay = 0.1 
}: AnimatedPageWrapperProps & { staggerDelay?: number }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

// Reveal on scroll wrapper
export function RevealOnScroll({ 
  children, 
  className = '', 
  threshold = 0.1 
}: AnimatedPageWrapperProps & { threshold?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}