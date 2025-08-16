'use client';

import { motion } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { AnimatedContainer, AnimatedHeading, AnimatedText, AnimatedCard } from '@/components/ui/animated-container';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    company: 'TechCorp',
    content: 'This platform has completely transformed how our team collaborates. The real-time features and intuitive interface make our workflow seamless. We\'ve seen a 40% increase in productivity since implementation.',
    rating: 5,
    avatar: 'SJ',
    video: true,
    results: ['40% productivity increase', 'Team collaboration improved', 'ROI achieved in 3 months']
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    company: 'StartupXYZ',
    content: 'The security features and performance optimizations are outstanding. As a CTO, I appreciate the enterprise-grade security and scalability. This solution has exceeded our expectations in every way.',
    rating: 5,
    avatar: 'MC',
    video: false,
    results: ['Enterprise security', '99.9% uptime', 'Seamless integration']
  },
  {
    name: 'Emily Rodriguez',
    role: 'Design Director',
    company: 'CreativeStudio',
    content: 'Beautiful design, smooth animations, and incredible attention to detail. This is exactly what modern web applications should feel like. Our clients love the new interface and capabilities.',
    rating: 5,
    avatar: 'ER',
    video: true,
    results: ['Client satisfaction 95%', 'Design awards won', 'User engagement +60%']
  },
  {
    name: 'David Kim',
    role: 'Operations Lead',
    company: 'GlobalEnterprise',
    content: 'The automation features have saved us countless hours. The analytics dashboard provides insights we never had before. This platform has become essential to our daily operations.',
    rating: 5,
    avatar: 'DK',
    video: false,
    results: ['Time saved 30hrs/week', 'Data-driven decisions', 'Cost reduction 25%']
  }
];

const companies = [
  { name: 'TechCorp', logo: 'TC' },
  { name: 'StartupXYZ', logo: 'SX' },
  { name: 'CreativeStudio', logo: 'CS' },
  { name: 'GlobalEnterprise', logo: 'GE' },
  { name: 'InnovateLab', logo: 'IL' },
  { name: 'DataFlow', logo: 'DF' }
];

export function EnhancedTestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <AnimatedContainer animation="fadeInDown">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Quote className="w-4 h-4" />
              <span>Customer Success Stories</span>
            </div>
          </AnimatedContainer>

          <AnimatedHeading
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl mb-6"
          >
            Loved by
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              {' '}Industry Leaders
            </span>
          </AnimatedHeading>

          <AnimatedText className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their workflow with our platform.
          </AnimatedText>
        </div>

        {/* Main testimonial carousel */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Testimonial card */}
            <div className="lg:col-span-2">
              <AnimatedCard
                className="p-8 md:p-12 h-full bg-gradient-to-br from-background to-muted/20 border border-primary/20 relative overflow-hidden"
                delay={0.2}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 2px, transparent 2px)`,
                    backgroundSize: '40px 40px'
                  }} />
                </div>

                <div className="relative z-10">
                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < currentTestimonial.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg md:text-xl text-foreground mb-8 leading-relaxed font-medium">
                    "{currentTestimonial.content}"
                  </blockquote>

                  {/* Results */}
                  <div className="mb-8">
                    <h4 className="font-semibold mb-3 text-primary">Key Results:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {currentTestimonial.results.map((result, index) => (
                        <motion.div
                          key={result}
                          className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">{result}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                        {currentTestimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{currentTestimonial.name}</div>
                        <div className="text-muted-foreground">
                          {currentTestimonial.role} at {currentTestimonial.company}
                        </div>
                      </div>
                    </div>
                    
                    {currentTestimonial.video && (
                      <motion.button
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">Watch Story</span>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Quote icon decoration */}
                <Quote className="absolute top-8 right-8 w-20 h-20 text-primary/10" />
              </AnimatedCard>
            </div>

            {/* Navigation and stats */}
            <div className="space-y-8">
              {/* Navigation */}
              <AnimatedContainer animation="fadeInUp" delay={0.4} className="text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <motion.button
                    onClick={prevTestimonial}
                    className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  
                  <div className="flex gap-2">
                    {testimonials.map((_, index) => (
                      <motion.button
                        key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsAutoPlaying(false);
                      setTimeout(() => setIsAutoPlaying(true), 10000);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-primary' : 'bg-primary/30'
                    }`}
                    whileHover={{ scale: 1.5 }}
                  />
                ))}
              </div>
              
              <motion.button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Stats summary */}
            <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-6 border border-primary/20">
              <h4 className="font-semibold mb-4 text-center">Overall Satisfaction</h4>
              <div className="space-y-4">
                {[
                  { label: 'Average Rating', value: '4.9/5', color: 'text-yellow-500' },
                  { label: 'Recommend Rate', value: '98%', color: 'text-green-500' },
                  { label: 'Support Response', value: '< 2hrs', color: 'text-blue-500' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </div>

    {/* Company logos */}
    <div className="max-w-5xl mx-auto">
      <AnimatedContainer animation="fadeInUp" delay={0.6}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Trusted by industry leaders worldwide</span>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ 
                opacity: 1, 
                scale: 1.05,
                borderColor: 'rgba(var(--primary), 0.3)'
              }}
            >
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-xs font-bold text-primary">
                {company.logo}
              </div>
              <span className="text-sm font-medium">{company.name}</span>
            </motion.div>
          ))}
        </div>
      </AnimatedContainer>
    </div>
  </div>
</section>
);
}