'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Smartphone, 
  BarChart3, 
  Users, 
  Cloud,
  Lock,
  Globe,
  Brain,
  Code,
  Database,
  Rocket
} from 'lucide-react';
import { AnimatedContainer, AnimatedHeading, AnimatedText, AnimatedCard } from '@/components/ui/animated-container';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: Rocket,
    title: 'Lightning Performance',
    description: 'Blazing fast load times and smooth interactions with optimized code and intelligent caching.',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    stats: '99.9% uptime'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Military-grade encryption, SOC 2 compliance, and advanced threat protection.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    stats: '256-bit encryption'
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Flawless experience across all devices with responsive design and touch optimization.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    stats: '100% responsive'
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Intelligent automation and predictive analytics powered by advanced machine learning.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    stats: 'Smart automation'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Real-time collaboration with live editing, comments, and seamless workflow integration.',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    stats: 'Real-time sync'
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    description: 'Scalable cloud architecture with automatic backups and global CDN distribution.',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/10',
    stats: 'Global CDN'
  }
];

const capabilities = [
  { icon: Code, title: 'Developer Friendly', description: 'RESTful APIs, SDKs, and comprehensive documentation' },
  { icon: Database, title: 'Data Analytics', description: 'Advanced reporting and business intelligence tools' },
  { icon: Globe, title: 'Global Reach', description: 'Multi-region deployment and localization support' },
  { icon: Lock, title: 'Privacy First', description: 'GDPR compliant with data residency options' }
];

export function EnhancedFeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/5"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <AnimatedContainer animation="fadeInDown">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Powerful Features</span>
            </div>
          </AnimatedContainer>

          <AnimatedHeading
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl mb-6"
          >
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              {' '}Succeed
            </span>
          </AnimatedHeading>

          <AnimatedText className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive suite of tools and features empowers you to achieve more with less effort.
          </AnimatedText>
        </div>

        {/* Main features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedCard
                key={feature.title}
                className="group p-8 h-full hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm"
                delay={index * 0.1}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                <div className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20`} />
                  <Icon className={`w-8 h-8 text-primary relative z-10`} />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <span className="text-sm font-medium text-primary/70">
                    {feature.stats}
                  </span>
                  <motion.div
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                    whileHover={{ scale: 1.2, backgroundColor: 'rgba(var(--primary), 0.2)' }}
                  >
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </motion.div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Capabilities section */}
        <div className="mb-20">
          <AnimatedContainer animation="fadeInUp" delay={0.6}>
            <h3 className="text-2xl font-bold text-center mb-12">Additional Capabilities</h3>
          </AnimatedContainer>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <AnimatedContainer
                  key={capability.title}
                  animation="fadeInUp"
                  delay={0.7 + index * 0.1}
                  className="group"
                >
                  <motion.div
                    className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 text-center"
                    whileHover={{ 
                      y: -5,
                      backgroundColor: 'rgba(var(--muted), 0.5)',
                      borderColor: 'rgba(var(--primary), 0.3)'
                    }}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {capability.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {capability.description}
                    </p>
                  </motion.div>
                </AnimatedContainer>
              );
            })}
          </div>
        </div>

        {/* Stats section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl blur-3xl" />
          <div className="relative bg-gradient-to-r from-primary/5 to-transparent rounded-3xl p-8 md:p-12 border border-primary/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Active Users', value: '50K+', suffix: '+', description: 'Worldwide' },
                { label: 'Projects Completed', value: '100K', suffix: '+', description: 'Delivered' },
                { label: 'Countries', value: '150', suffix: '+', description: 'Global reach' },
                { label: 'Customer Satisfaction', value: '4.9', suffix: '/5', description: 'Average rating' }
              ].map((stat, index) => (
                <AnimatedContainer
                  key={stat.label}
                  animation="fadeInUp"
                  delay={0.8 + index * 0.1}
                  className="text-center"
                >
                  <motion.div
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    {stat.value}
                    <motion.span
                      className="text-2xl text-primary/70"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 + index * 0.1 }}
                    >
                      {stat.suffix}
                    </motion.span>
                  </motion.div>
                  <p className="text-lg font-semibold text-foreground mb-1">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </AnimatedContainer>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper component for arrow icon
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}