'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import {
  fadeInVariants,
  fadeInUpVariants,
  fadeInDownVariants,
  fadeInLeftVariants,
  fadeInRightVariants,
  scaleInVariants,
  scaleUpVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  staggerContainer,
  pulseVariants,
  loadingVariants,
  pageTransition
} from '@/lib/animations';

type AnimationType = 
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'scaleIn'
  | 'scaleUp'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'stagger'
  | 'pulse'
  | 'loading'
  | 'pageTransition';

interface AnimatedContainerProps extends MotionProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  once?: boolean;
}

const animationVariants = {
  fadeIn: fadeInVariants,
  fadeInUp: fadeInUpVariants,
  fadeInDown: fadeInDownVariants,
  fadeInLeft: fadeInLeftVariants,
  fadeInRight: fadeInRightVariants,
  scaleIn: scaleInVariants,
  scaleUp: scaleUpVariants,
  slideUp: slideUpVariants,
  slideDown: slideDownVariants,
  slideLeft: slideLeftVariants,
  slideRight: slideRightVariants,
  stagger: staggerContainer,
  pulse: pulseVariants,
  loading: loadingVariants,
  pageTransition: pageTransition
};

export function AnimatedContainer({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration,
  className = '',
  as = 'div',
  once = true,
  ...props
}: AnimatedContainerProps) {
  const MotionComponent = motion[as as keyof typeof motion] as any;
  const variants = animationVariants[animation];

  const customTransition = duration
    ? { ...variants.visible.transition, duration }
    : variants.visible.transition;

  return (
    <MotionComponent
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ ...customTransition, delay }}
      viewport={{ once }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

// Specialized animated components
export function AnimatedCard({ children, className = '', ...props }: Omit<AnimatedContainerProps, 'animation'>) {
  return (
    <AnimatedContainer
      animation="scaleIn"
      className={`bg-card text-card-foreground rounded-lg border shadow-sm ${className}`}
      {...props}
    >
      {children}
    </AnimatedContainer>
  );
}

export function AnimatedSection({ children, className = '', ...props }: Omit<AnimatedContainerProps, 'animation'>) {
  return (
    <AnimatedContainer
      animation="fadeInUp"
      className={`w-full ${className}`}
      {...props}
    >
      {children}
    </AnimatedContainer>
  );
}

export function AnimatedList({ children, className = '', ...props }: Omit<AnimatedContainerProps, 'animation'>) {
  return (
    <AnimatedContainer
      animation="stagger"
      className={`space-y-4 ${className}`}
      {...props}
    >
      {children}
    </AnimatedContainer>
  );
}

export function AnimatedListItem({ children, className = '', ...props }: Omit<AnimatedContainerProps, 'animation'>) {
  return (
    <AnimatedContainer
      animation="fadeInUp"
      className={className}
      {...props}
    >
      {children}
    </AnimatedContainer>
  );
}

export function AnimatedHeading({ 
  children, 
  className = '', 
  as = 'h2',
  ...props 
}: Omit<AnimatedContainerProps, 'animation' | 'as'> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }) {
  return (
    <AnimatedContainer
      animation="fadeInDown"
      as={as}
      className={`font-bold tracking-tight ${className}`}
      {...props}
    >
      {children}
    </AnimatedContainer>
  );
}

export function AnimatedText({ children, className = '', ...props }: Omit<AnimatedContainerProps, 'animation'>) {
  return (
    <AnimatedContainer
      animation="fadeInUp"
      as="p"
      className={`leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </AnimatedContainer>
  );
}

export function AnimatedButton({ children, className = '', ...props }: Omit<AnimatedContainerProps, 'animation'>) {
  return (
    <AnimatedContainer
      animation="scaleIn"
      as="button"
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </AnimatedContainer>
  );
}

export function AnimatedImage({ 
  children, 
  className = '', 
  ...props 
}: Omit<AnimatedContainerProps, 'animation' | 'as'>) {
  return (
    <AnimatedContainer
      animation="scaleIn"
      as="div"
      className={`overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </AnimatedContainer>
  );
}

export function PulseContainer({ children, className = '', ...props }: Omit<AnimatedContainerProps, 'animation'>) {
  return (
    <AnimatedContainer
      animation="pulse"
      className={className}
      {...props}
    >
      {children}
    </AnimatedContainer>
  );
}