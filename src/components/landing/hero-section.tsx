'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle, Star } from 'lucide-react';
import { AnimatedContainer, AnimatedHeading, AnimatedText, AnimatedButton } from '@/components/ui/animated-container';

export function HeroSection() {
  const features = [
    'Real-time collaboration',
    'Advanced analytics',
    'Secure authentication',
    'Mobile responsive'
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/5"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <AnimatedContainer animation="fadeInDown" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Star className="w-4 h-4" />
                <span>Now with enhanced security</span>
              </div>
            </AnimatedContainer>

            <AnimatedHeading
              as="h1"
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
              delay={0.2}
            >
              Transform Your
              <span className="text-primary"> Digital Experience</span>
            </AnimatedHeading>

            <AnimatedText
              className="text-lg md:text-xl text-muted-foreground max-w-lg"
              delay={0.3}
            >
              Experience the next generation of web applications with cutting-edge technology, 
              seamless animations, and unparalleled performance.
            </AnimatedText>

            <AnimatedContainer animation="fadeInUp" delay={0.4} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <AnimatedButton
                  size="lg"
                  className="px-8 py-3 text-lg group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
                
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </AnimatedButton>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fadeInUp" delay={0.5} className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </AnimatedContainer>
          </div>

          {/* Right content - Animated illustration */}
          <AnimatedContainer animation="scaleIn" delay={0.3} className="relative">
            <motion.div
              className="relative mx-auto max-w-lg"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Main card */}
              <motion.div
                className="bg-card border rounded-2xl shadow-2xl p-8 relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  {/* Mock header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary-foreground rounded" />
                      </div>
                      <div>
                        <div className="h-4 bg-muted rounded w-24 mb-1" />
                        <div className="h-3 bg-muted/50 rounded w-16" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-muted rounded-lg" />
                      <div className="w-8 h-8 bg-muted rounded-lg" />
                    </div>
                  </div>

                  {/* Mock content */}
                  <div className="space-y-4">
                    <div className="h-8 bg-muted rounded w-3/4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-5/6" />
                      <div className="h-4 bg-muted rounded w-4/6" />
                    </div>
                  </div>

                  {/* Mock stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                      >
                        <div className="h-8 bg-primary/10 rounded w-full mb-2 mx-auto" />
                        <div className="h-3 bg-muted rounded w-12 mx-auto" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-16 h-16 bg-primary rounded-xl shadow-lg"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              
              <motion.div
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-500 rounded-xl shadow-lg"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </AnimatedContainer>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-6 h-10 border-2 border-border rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
}