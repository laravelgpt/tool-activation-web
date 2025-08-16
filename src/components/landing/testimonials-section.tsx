'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { AnimatedContainer, AnimatedHeading, AnimatedText, AnimatedCard } from '@/components/ui/animated-container';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    company: 'TechCorp',
    content: 'This platform has completely transformed how our team collaborates. The real-time features and intuitive interface make our workflow seamless.',
    rating: 5,
    avatar: 'SJ'
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    company: 'StartupXYZ',
    content: 'The security features and performance optimizations are outstanding. We\'ve seen a 40% increase in productivity since implementing this solution.',
    rating: 5,
    avatar: 'MC'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Design Director',
    company: 'CreativeStudio',
    content: 'Beautiful design, smooth animations, and incredible attention to detail. This is exactly what modern web applications should feel like.',
    rating: 5,
    avatar: 'ER'
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <AnimatedContainer animation="fadeInDown">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Quote className="w-4 h-4" />
              <span>What Our Users Say</span>
            </div>
          </AnimatedContainer>

          <AnimatedHeading
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl mb-6"
          >
            Loved by
            <span className="text-primary"> Thousands</span>
          </AnimatedHeading>

          <AnimatedText className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their workflow with our platform.
          </AnimatedText>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedCard
              key={testimonial.name}
              className="p-8 h-full hover:shadow-xl transition-all duration-300"
              delay={index * 0.2}
              whileHover={{ y: -5 }}
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Trust indicators */}
        <AnimatedContainer
          animation="fadeInUp"
          delay={0.8}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Trusted by industry leaders worldwide</span>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}