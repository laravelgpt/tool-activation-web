'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Users, 
  Database,
  Shield,
  Headphones,
  ArrowRight
} from 'lucide-react';
import { AnimatedContainer, AnimatedHeading, AnimatedText, AnimatedCard } from '@/components/ui/animated-container';

const pricingPlans = [
  {
    name: 'Starter',
    price: '$29',
    period: 'per month',
    description: 'Perfect for individuals and small teams getting started',
    popular: false,
    features: [
      'Up to 5 users',
      '10GB storage',
      'Basic analytics',
      'Email support',
      'Mobile apps',
      'Basic integrations'
    ],
    cta: 'Get Started',
    highlight: false
  },
  {
    name: 'Professional',
    price: '$79',
    period: 'per month',
    description: 'Ideal for growing teams and businesses',
    popular: true,
    features: [
      'Up to 25 users',
      '100GB storage',
      'Advanced analytics',
      'Priority support',
      'Advanced integrations',
      'Custom branding',
      'API access',
      'Advanced security'
    ],
    cta: 'Start Free Trial',
    highlight: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom needs',
    popular: false,
    features: [
      'Unlimited users',
      'Unlimited storage',
      'Custom analytics',
      '24/7 dedicated support',
      'Custom integrations',
      'White-label solution',
      'Advanced API access',
      'Enterprise security',
      'Custom training',
      'SLA guarantee'
    ],
    cta: 'Contact Sales',
    highlight: false
  }
];

const features = [
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Real-time collaboration with unlimited team members'
  },
  {
    icon: Database,
    title: 'Unlimited Storage',
    description: 'Scalable storage with automatic backups'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Advanced security features and compliance'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support'
  }
];

export function PricingSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
              <Crown className="w-4 h-4" />
              <span>Simple, Transparent Pricing</span>
            </div>
          </AnimatedContainer>

          <AnimatedHeading
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl mb-6"
          >
            Choose Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              {' '}Perfect Plan
            </span>
          </AnimatedHeading>

          <AnimatedText className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required. Upgrade or downgrade at any time.
          </AnimatedText>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {pricingPlans.map((plan, index) => (
            <AnimatedContainer
              key={plan.name}
              animation="fadeInUp"
              delay={index * 0.1}
              className="relative"
            >
              <motion.div
                className={`relative h-full rounded-2xl border-2 p-8 ${
                  plan.popular
                    ? 'border-primary bg-gradient-to-b from-primary/5 to-background'
                    : 'border-border bg-card'
                }`}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-semibold rounded-full"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      Most Popular
                    </div>
                  </motion.div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground"> {plan.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + featureIndex * 0.05 }}
                    >
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className={`w-full py-3 font-semibold ${
                      plan.popular
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatedContainer>
          ))}
        </div>

        {/* Features comparison */}
        <div className="mb-20">
          <AnimatedContainer animation="fadeInUp" delay={0.4}>
            <h3 className="text-2xl font-bold text-center mb-12">Everything You Need to Succeed</h3>
          </AnimatedContainer>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <AnimatedContainer
                  key={feature.title}
                  animation="fadeInUp"
                  delay={0.5 + index * 0.1}
                >
                  <motion.div
                    className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 text-center h-full"
                    whileHover={{ 
                      y: -5,
                      backgroundColor: 'rgba(var(--muted), 0.5)',
                      borderColor: 'rgba(var(--primary), 0.3)'
                    }}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </motion.div>
                </AnimatedContainer>
              );
            })}
          </div>
        </div>

        {/* FAQ section */}
        <div className="max-w-4xl mx-auto">
          <AnimatedContainer animation="fadeInUp" delay={0.6}>
            <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          </AnimatedContainer>
          
          <div className="space-y-4">
            {[
              {
                question: 'Can I change plans later?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.'
              },
              {
                question: 'Is there a long-term contract?',
                answer: 'No, we offer month-to-month billing. You can cancel anytime without penalty.'
              },
              {
                question: 'Do you offer discounts for non-profits?',
                answer: 'Yes, we offer special pricing for non-profit organizations. Contact our sales team for details.'
              }
            ].map((faq, index) => (
              <AnimatedContainer
                key={faq.question}
                animation="fadeInUp"
                delay={0.7 + index * 0.1}
              >
                <motion.div
                  className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300"
                  whileHover={{ 
                    backgroundColor: 'rgba(var(--muted), 0.5)',
                    borderColor: 'rgba(var(--primary), 0.3)'
                  }}
                >
                  <h4 className="font-semibold mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </motion.div>
              </AnimatedContainer>
            ))}
          </div>
        </div>

        {/* Money back guarantee */}
        <AnimatedContainer animation="fadeInUp" delay={0.8} className="mt-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-full">
              <Shield className="w-5 h-5" />
              <span className="font-medium">30-Day Money-Back Guarantee</span>
            </div>
            <p className="mt-4 text-muted-foreground">
              Try us risk-free. If you\'re not satisfied, we\'ll refund your payment within 30 days.
            </p>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}