'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { AnimatedContainer, AnimatedHeading, AnimatedText, AnimatedButton } from '@/components/ui/animated-container';

export function CTASection() {
  const benefits = [
    '14-day free trial',
    'No credit card required',
    'Cancel anytime',
    '24/7 support'
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedContainer animation="fadeInDown">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Get Started Today</span>
            </div>
          </AnimatedContainer>

          <AnimatedHeading
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl mb-6 text-white"
          >
            Ready to Transform Your
            <span className="text-white/90"> Workflow?</span>
          </AnimatedHeading>

          <AnimatedText className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of teams already using our platform to boost productivity and collaboration.
          </AnimatedText>

          <AnimatedContainer animation="fadeInUp" delay={0.3} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <AnimatedButton
                size="lg"
                variant="secondary"
                className="px-8 py-3 text-lg font-semibold group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
              
              <AnimatedButton
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg font-semibold border-white text-white hover:bg-white hover:text-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule Demo
              </AnimatedButton>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  className="flex items-center gap-2 text-white/90 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Check className="w-4 h-4 text-green-300" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>
          </AnimatedContainer>

          {/* Animated trust indicators */}
          <AnimatedContainer
            animation="fadeInUp"
            delay={0.8}
            className="mt-12"
          >
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              {['Secure', 'Fast', 'Reliable', 'Scalable'].map((item, index) => (
                <motion.div
                  key={item}
                  className="text-sm font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </section>
  );
}