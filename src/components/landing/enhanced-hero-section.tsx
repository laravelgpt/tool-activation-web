'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle, Star, Shield, Zap, Lock, Globe } from 'lucide-react';
import { AnimatedContainer, AnimatedHeading, AnimatedText, AnimatedButton } from '@/components/ui/animated-container';
import { useState, useEffect } from 'react';

export function EnhancedHeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: Shield, title: 'Secure Unlock', desc: 'Military-grade encryption' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Instant tool activation' },
    { icon: Lock, title: 'Access Control', desc: 'Advanced permissions' },
    { icon: Globe, title: 'Global Access', desc: 'Worldwide availability' }
  ];

  const tools = [
    'Premium Software Tools',
    'Development Utilities',
    'Design Applications',
    'Productivity Suites',
    'Security Tools',
    'Analytics Platforms'
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background with mouse tracking */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs that follow mouse */}
        <motion.div
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
          style={{
            right: mousePosition.x - 128,
            bottom: mousePosition.y - 128,
          }}
          animate={{
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <motion.div 
        className="container mx-auto px-4 relative z-10"
        style={{ y }}
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <AnimatedContainer animation="fadeInDown" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Trusted by 100,000+ Users</span>
              </div>
            </AnimatedContainer>

            <AnimatedHeading
              as="h1"
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white"
              delay={0.2}
            >
              Unlock Premium
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {" "}Tools
              </span>
              <br />
              Instantly
            </AnimatedHeading>

            <AnimatedText
              className="text-lg md:text-xl text-gray-300 max-w-lg leading-relaxed"
              delay={0.3}
            >
              Access the world's most powerful software tools with our advanced unlocking platform. 
              Secure, fast, and reliable tool activation for professionals and enterprises.
            </AnimatedText>

            <AnimatedContainer animation="fadeInUp" delay={0.4} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <AnimatedButton
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Unlocking
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
                
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold border-white/20 text-white hover:bg-white/10 backdrop-blur-sm group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </AnimatedButton>
              </div>

              {/* Available tools showcase */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Popular Tools Available:</h3>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool, index) => (
                    <motion.span
                      key={tool}
                      className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ 
                        scale: 1.05, 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderColor: 'rgba(255,255,255,0.4)'
                      }}
                    >
                      {tool}
                    </motion.span>
                  ))}
                </div>
              </div>
            </AnimatedContainer>
          </div>

          {/* Right content - Animated tool showcase */}
          <AnimatedContainer animation="scaleIn" delay={0.3} className="relative">
            <motion.div
              className="relative mx-auto max-w-lg"
              animate={{
                y: [0, -10, 0],
                rotateY: [0, 5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Main tool card */}
              <motion.div
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 relative overflow-hidden"
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 5,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: 'linear-gradient(45deg, #8b5cf6, #ec4899, #3b82f6)',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                <div className="relative z-10 space-y-6">
                  {/* Tool header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Lock className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <div className="h-5 bg-white/20 rounded w-32 mb-1" />
                        <div className="h-3 bg-white/10 rounded w-20" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.div
                        className="w-10 h-10 bg-white/10 rounded-lg backdrop-blur-sm"
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                      />
                      <motion.div
                        className="w-10 h-10 bg-white/10 rounded-lg backdrop-blur-sm"
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                      />
                    </div>
                  </div>

                  {/* Tool status */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Status</span>
                      <motion.span
                        className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity 
                        }}
                      >
                        ✓ Active
                      </motion.span>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-3">
                      {[
                        { label: 'Security', value: 95 },
                        { label: 'Performance', value: 88 },
                        { label: 'Reliability', value: 92 }
                      ].map((metric, index) => (
                        <motion.div
                          key={metric.label}
                          className="space-y-1"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                        >
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">{metric.label}</span>
                            <span className="text-white">{metric.value}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.value}%` }}
                              transition={{ duration: 1, delay: 1 + index * 0.2 }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Unlock Now
                    </motion.button>
                    <motion.button
                      className="flex-1 py-2 px-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm font-medium"
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Floating feature badges */}
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const positions = [
                  { top: '-20px', right: '-20px' },
                  { bottom: '-20px', left: '-20px' },
                  { top: '50%', right: '-30px' },
                  { bottom: '-20px', right: '50%' }
                ];
                
                return (
                  <motion.div
                    key={feature.title}
                    className={`absolute ${positions[index].top} ${positions[index].right} ${positions[index].bottom} ${positions[index].left} w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex flex-col items-center justify-center p-2 shadow-lg`}
                    animate={{
                      y: [0, -5, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 3 + index,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.5
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }}
                  >
                    <Icon className="w-6 h-6 text-white mb-1" />
                    <span className="text-xs text-white text-center leading-tight">{feature.title}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatedContainer>
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
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}