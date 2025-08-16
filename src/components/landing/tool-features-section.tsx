'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Key, 
  Globe, 
  Users, 
  Cloud,
  Lock,
  Smartphone,
  Cpu,
  Database,
  Network,
  Fingerprint
} from 'lucide-react';
import { AnimatedContainer, AnimatedHeading, AnimatedText, AnimatedCard } from '@/components/ui/animated-container';

const toolFeatures = [
  {
    icon: Key,
    title: 'Instant Tool Activation',
    description: 'Unlock premium tools instantly with our advanced activation system. No waiting, immediate access.',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    stats: '99.9% Uptime'
  },
  {
    icon: Shield,
    title: 'Military-Grade Security',
    description: 'Bank-level encryption protects your tools and data. Advanced security protocols ensure complete safety.',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-500/10',
    stats: '256-bit Encryption'
  },
  {
    icon: Zap,
    title: 'Lightning Performance',
    description: 'Optimized for speed and efficiency. Tools run at peak performance with zero lag or delays.',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    stats: '10x Faster'
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Access your tools from anywhere in the world. Global CDN ensures fast access regardless of location.',
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-500/10',
    stats: '150+ Countries'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share and manage tools across your team. Advanced permission controls for seamless collaboration.',
    color: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-500/10',
    stats: 'Unlimited Users'
  },
  {
    icon: Cloud,
    title: 'Cloud Integration',
    description: 'Seamless cloud backup and sync. Your tools are always available and up to date across all devices.',
    color: 'from-indigo-400 to-purple-500',
    bgColor: 'bg-indigo-500/10',
    stats: 'Auto Sync'
  }
];

const toolCategories = [
  {
    icon: Cpu,
    title: 'Development Tools',
    count: '500+',
    description: 'IDEs, compilers, debuggers, and development utilities'
  },
  {
    icon: Smartphone,
    title: 'Mobile Tools',
    count: '200+',
    description: 'iOS and Android development and testing tools'
  },
  {
    icon: Database,
    title: 'Database Tools',
    count: '100+',
    description: 'Database management, optimization, and analytics tools'
  },
  {
    icon: Network,
    title: 'Network Tools',
    count: '150+',
    description: 'Network monitoring, security, and optimization tools'
  },
  {
    icon: Fingerprint,
    title: 'Security Tools',
    count: '300+',
    description: 'Penetration testing, encryption, and security analysis'
  },
  {
    icon: Lock,
    title: 'Premium Software',
    count: '1000+',
    description: 'Adobe, Microsoft, Autodesk and other premium software'
  }
];

export function ToolFeaturesSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <AnimatedContainer animation="fadeInDown">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Lock className="w-4 h-4" />
              <span>Advanced Tool Unlocking</span>
            </div>
          </AnimatedContainer>

          <AnimatedHeading
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl mb-6"
          >
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              {" "}Unlock Success
            </span>
          </AnimatedHeading>

          <AnimatedText className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform provides everything you need to unlock, manage, and optimize your premium tools.
          </AnimatedText>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {toolFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedCard
                key={feature.title}
                className="p-8 h-full hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                delay={index * 0.1}
                whileHover={{ y: -10 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(45deg, ${(feature.color.split(' ')[0] || '').replace('from-', '')}, ${(feature.color.split(' ')[2] || '').replace('to-', '')})`
                  }}
                />

                <div className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <div className={`w-8 h-8 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors relative z-10">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed mb-4 relative z-10">
                  {feature.description}
                </p>

                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span>{feature.stats}</span>
                </motion.div>

                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </AnimatedCard>
            );
          })}
        </div>

        {/* Tool Categories Section */}
        <div className="mb-16">
          <AnimatedHeading
            as="h3"
            className="text-2xl md:text-3xl text-center mb-12"
          >
            Available Tool
            <span className="text-primary"> Categories</span>
          </AnimatedHeading>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.title}
                  className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ 
                    y: -5,
                    borderColor: 'hsl(var(--primary))',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {category.title}
                        </h4>
                        <motion.span
                          className="text-2xl font-bold text-primary"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            delay: 0.5 + index * 0.1,
                            type: 'spring',
                            stiffness: 200
                          }}
                        >
                          {category.count}
                        </motion.span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Active Tools', value: '2,500+', suffix: '+' },
            { label: 'Happy Users', value: '100K', suffix: '+' },
            { label: 'Success Rate', value: '99.9', suffix: '%' },
            { label: 'Support Response', value: '< 2', suffix: 'min' }
          ].map((stat, index) => (
            <AnimatedContainer
              key={stat.label}
              animation="fadeInUp"
              delay={0.6 + index * 0.1}
              className="text-center"
            >
              <motion.div
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 0.8 + index * 0.1,
                  type: 'spring',
                  stiffness: 200
                }}
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
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}