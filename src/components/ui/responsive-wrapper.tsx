'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  animate?: boolean;
}

export function ResponsiveWrapper({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName,
  animate = true,
}: ResponsiveWrapperProps) {
  const getResponsiveClasses = () => {
    const classes = [className];
    
    if (mobileClassName) classes.push(mobileClassName);
    if (tabletClassName) classes.push(tabletClassName);
    if (desktopClassName) classes.push(desktopClassName);
    
    return cn(...classes);
  };

  const MotionDiv = animate ? motion.div : 'div';

  return (
    <MotionDiv
      className={getResponsiveClasses()}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={animate ? { duration: 0.3 } : undefined}
    >
      {children}
    </MotionDiv>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className,
}: ResponsiveGridProps) {
  const gridClasses = [
    'grid',
    `gap-${gap}`,
    cols.mobile && `grid-cols-${cols.mobile}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function ResponsiveContainer({
  children,
  size = 'lg',
  className,
}: ResponsiveContainerProps) {
  const containerClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8', containerClasses[size], className)}>
      {children}
    </div>
  );
}

interface ResponsiveFlexProps {
  children: ReactNode;
  direction?: {
    mobile?: 'row' | 'col';
    tablet?: 'row' | 'col';
    desktop?: 'row' | 'col';
  };
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  gap?: number;
  className?: string;
}

export function ResponsiveFlex({
  children,
  direction = { mobile: 'col', tablet: 'row', desktop: 'row' },
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 4,
  className,
}: ResponsiveFlexProps) {
  const flexClasses = [
    'flex',
    direction.mobile === 'col' ? 'flex-col' : 'flex-row',
    direction.tablet === 'col' ? `md:flex-col` : `md:flex-row`,
    direction.desktop === 'col' ? `lg:flex-col` : `lg:flex-row`,
    `justify-${justify}`,
    `items-${align}`,
    wrap && 'flex-wrap',
    `gap-${gap}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: ReactNode;
  size?: {
    mobile?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    tablet?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    desktop?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  };
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function ResponsiveText({
  children,
  size = { mobile: 'base', tablet: 'base', desktop: 'base' },
  weight = 'normal',
  className,
  as: Component = 'p',
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const textClasses = [
    sizeClasses[size.mobile],
    size.tablet && `md:${sizeClasses[size.tablet]}`,
    size.desktop && `lg:${sizeClasses[size.desktop]}`,
    weightClasses[weight],
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={textClasses}>
      {children}
    </Component>
  );
}

interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}

export function ResponsiveImage({
  src,
  alt,
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className,
  priority = false,
  loading = 'lazy',
}: ResponsiveImageProps) {
  return (
    <motion.img
      src={src}
      alt={alt}
      sizes={sizes}
      className={cn('w-full h-auto object-cover', className)}
      loading={loading}
      priority={priority}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    />
  );
}

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export function ResponsiveCard({
  children,
  className,
  hover = true,
  clickable = false,
  onClick,
}: ResponsiveCardProps) {
  return (
    <motion.div
      className={cn(
        'bg-card text-card-foreground rounded-lg border shadow-sm',
        'p-4 sm:p-6',
        hover && 'hover:shadow-lg hover:shadow-primary/5',
        clickable && 'cursor-pointer',
        className
      )}
      whileHover={hover ? { y: -2 } : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      onClick={clickable ? onClick : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}