'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Star, 
  Zap, 
  Shield,
  Users,
  TrendingUp,
  Gift
} from 'lucide-react';
import { AnimatedContainer, AnimatedHeading, AnimatedText, AnimatedButton } from '@/components/ui/animated-container';
import { useState } from 'react';

export function EnhancedCtaSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const benefits = [
    { icon: Gift, title: '14-day free trial', description: 'Full access to all features' },
    { icon: Shield, title: 'No credit card', description: 'Start instantly, no commitment' },
    { icon: Users, title: '24/7 support', description: 'Expert help whenever you need it' },
    { icon: TrendingUp, title: 'Cancel anytime', description: 'No long-term contracts' }
  ];

  const features = [
    { icon: Star, label: '50K+ Active Users' },
    { icon: Zap, label: 'Lightning Fast' },
    { icon: Shield, label: 'Enterprise Grade' },
    { icon: Users, label: 'Team Collaboration' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success message
    alert('Thank you for your interest! We\'ll be in touch soon.');
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
      
      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
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
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <AnimatedContainer animation="fadeInDown">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Limited Time Offer</span>
                </div>
              </AnimatedContainer>

              <AnimatedHeading
                as="h2"
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
              >
                Ready to Transform Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {' '}Business?
                </span>
              </AnimatedHeading>

              <AnimatedText className="text-lg text-gray-300 leading-relaxed">
                Join thousands of teams already using our platform to boost productivity, 
                enhance collaboration, and drive growth. Start your free trial today.
              </AnimatedText>

              {/* Email capture form */}
              <AnimatedContainer animation="fadeInUp" delay={0.3}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.div
                      className="flex-1"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all duration-300"
                      />
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          <>
                            Start Free Trial
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                  
                  <p className="text-sm text-gray-400 text-center">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </AnimatedContainer>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <AnimatedContainer
                      key={benefit.title}
                      animation="fadeInUp"
                      delay={0.4 + index * 0.1}
                    >
                      <motion.div
                        className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                        whileHover={{ 
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderColor: 'rgba(255,255,255,0.2)',
                          y: -2
                        }}
                      >
                        <Icon className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-white text-sm mb-1">
                            {benefit.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            {benefit.description}
                          </div>
                        </div>
                      </motion.div>
                    </AnimatedContainer>
                  );
                })}
              </div>
            </div>

            {/* Right content - Feature showcase */}
            <AnimatedContainer animation="scaleIn" delay={0.2} className="relative">
              <motion.div
                className="relative"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Main card */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
                      backgroundSize: '40px 40px'
                    }} />
                  </div>

                  <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded-lg" />
                        </div>
                        <div>
                          <div className="h-5 bg-white/20 rounded w-24 mb-1" />
                          <div className="h-3 bg-white/10 rounded w-16" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-10 h-10 bg-white/10 rounded-xl" />
                        ))}
                      </div>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                          <motion.div
                            key={feature.label}
                            className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className="w-5 h-5 text-purple-400" />
                              <div className="h-3 bg-white/20 rounded w-16" />
                            </div>
                            <div className="h-8 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded w-full" />
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Activity timeline */}
                    <div className="space-y-3">
                      <div className="h-4 bg-white/20 rounded w-20" />
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                        >
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="h-3 bg-white/20 rounded w-full mb-1" />
                            <div className="h-2 bg-white/10 rounded w-3/4" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                
                <motion.div
                  className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl"
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </AnimatedContainer>
          </div>

          {/* Trust indicators */}
          <AnimatedContainer animation="fadeInUp" delay={0.6} className="mt-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-8 px-8 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Secure & Private</span>
                </div>
                <div className="w-px h-6 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">4.9/5 Rating</span>
                </div>
                <div className="w-px h-6 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">50K+ Users</span>
                </div>
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </section>
  );
}