'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Moon, 
  Sun, 
  Github, 
  Twitter, 
  Linkedin,
  ArrowDown,
  Sparkles
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { EnhancedHeroSection } from './enhanced-hero-section';
import { EnhancedFeaturesSection } from './enhanced-features-section';
import { EnhancedTestimonialsSection } from './enhanced-testimonials-section';
import { EnhancedCtaSection } from './enhanced-cta-section';
import { PricingSection } from './pricing-section';
import { AnimatedContainer, AnimatedButton } from '@/components/ui/animated-container';

export function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['home', 'features', 'testimonials', 'pricing', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: 'Features', href: 'features', icon: Sparkles },
    { label: 'Testimonials', href: 'testimonials', icon: 'Quote' },
    { label: 'Pricing', href: 'pricing', icon: 'DollarSign' },
    { label: 'Contact', href: 'contact', icon: 'Mail' }
  ];

  return (
    <div className="min-h-screen">
      {/* Enhanced Navigation */}
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md border-b shadow-lg'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Enhanced Logo */}
            <AnimatedContainer animation="fadeInLeft">
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center"
                  whileHover={{ rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <div className="w-4 h-4 bg-background rounded-sm" />
                </motion.div>
                <span className="font-bold text-xl">Platform</span>
              </motion.div>
            </AnimatedContainer>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                      activeSection === item.href
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => scrollToSection(item.href)}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {item.label}
                    {activeSection === item.href && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="activeSection"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </AnimatedButton>

                <AnimatedButton
                  variant="outline"
                  size="sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </AnimatedButton>

                <AnimatedButton
                  size="sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </AnimatedButton>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </AnimatedButton>

              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </AnimatedButton>
            </div>
          </div>

          {/* Enhanced Mobile Navigation */}
          <motion.div
            className={`md:hidden overflow-hidden ${
              isMenuOpen ? 'border-t bg-background/95 backdrop-blur-md' : ''
            }`}
            initial={{ height: 0 }}
            animate={{ height: isMenuOpen ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="py-4 space-y-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted'
                  }`}
                  onClick={() => scrollToSection(item.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                </motion.button>
              ))}
              <div className="flex gap-2 px-4 pt-4">
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </AnimatedButton>
                <AnimatedButton
                  size="sm"
                  className="flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main>
        <section id="home">
          <EnhancedHeroSection />
        </section>
        <section id="features">
          <EnhancedFeaturesSection />
        </section>
        <section id="testimonials">
          <EnhancedTestimonialsSection />
        </section>
        <section id="pricing">
          <PricingSection />
        </section>
        <section id="contact">
          <EnhancedCtaSection />
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-b from-muted/30 to-background border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company */}
            <div className="space-y-6">
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-background rounded-sm" />
                </div>
                <span className="font-bold text-xl">Platform</span>
              </motion.div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Transforming digital experiences with cutting-edge technology and innovative solutions.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Github, href: '#', label: 'GitHub' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' }
                ].map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Product</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {['Features', 'Pricing', 'Security', 'Updates', 'Roadmap'].map((item, index) => (
                  <motion.li key={item}>
                    <motion.a
                      href="#"
                      className="hover:text-primary transition-colors inline-block"
                      whileHover={{ x: 5 }}
                    >
                      {item}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {['About', 'Blog', 'Careers', 'Press', 'Contact'].map((item, index) => (
                  <motion.li key={item}>
                    <motion.a
                      href="#"
                      className="hover:text-primary transition-colors inline-block"
                      whileHover={{ x: 5 }}
                    >
                      {item}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {['Privacy', 'Terms', 'Cookies', 'Licenses', 'Compliance'].map((item, index) => (
                  <motion.li key={item}>
                    <motion.a
                      href="#"
                      className="hover:text-primary transition-colors inline-block"
                      whileHover={{ x: 5 }}
                    >
                      {item}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 Platform. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <motion.a
                  href="#"
                  className="hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Status
                </motion.a>
                <motion.a
                  href="#"
                  className="hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Docs
                </motion.a>
                <motion.a
                  href="#"
                  className="hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  API
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}