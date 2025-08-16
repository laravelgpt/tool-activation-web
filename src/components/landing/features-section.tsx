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
  Globe
} from 'lucide-react';
import { AnimatedContainer, AnimatedHeading, AnimatedText, AnimatedCard } from '@/components/ui/animated-container';

const features = [
  {
    icon: Shield,
    title: 'Enhanced Security',
    description: 'Military-grade encryption with two-factor authentication and secure data storage.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance with instant loading and smooth animations.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Fully responsive design that works flawlessly on all devices.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive insights and real-time data visualization.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Seamless teamwork with real-time updates and communication.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    icon: Cloud,
    title: 'Cloud Integration',
    description: 'Automatic backup and sync across all your devices.',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <AnimatedContainer animation="fadeInDown">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Lock className="w-4 h-4" />
              <span>Powerful Features</span>
            </div>
          </AnimatedContainer>

          <AnimatedHeading
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl mb-6"
          >
            Everything You Need to
            <span className="text-primary"> Succeed</span>
          </AnimatedHeading>

          <AnimatedText className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive suite of tools and features empowers you to achieve more with less effort.
          </AnimatedText>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedCard
                key={feature.title}
                className="p-8 h-full hover:shadow-xl transition-all duration-300 group"
                delay={index * 0.1}
                whileHover={{ y: -5 }}
              >
                <div className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                <motion.div
                  className="mt-6 flex items-center gap-2 text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <span>Learn more</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Globe className="w-4 h-4" />
                  </motion.div>
                </motion.div>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Animated stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Active Users', value: '50K+', suffix: '+' },
            { label: 'Projects Completed', value: '100K', suffix: '+' },
            { label: 'Countries', value: '150', suffix: '+' },
            { label: 'Uptime', value: '99.9', suffix: '%' }
          ].map((stat, index) => (
            <AnimatedContainer
              key={stat.label}
              animation="fadeInUp"
              delay={0.6 + index * 0.1}
              className="text-center"
            >
              <motion.div
                className="text-4xl md:text-5xl font-bold text-primary mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                {stat.value}
                <motion.span
                  className="text-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  {stat.suffix}
                </motion.span>
              </motion.div>
              <p className="text-muted-foreground">{stat.label}</p>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}