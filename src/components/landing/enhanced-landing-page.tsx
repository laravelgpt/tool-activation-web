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
  Star,
  Shield,
  Zap
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/language-context';
import { useState, useEffect } from 'react';
import { EnhancedHeroSection } from './enhanced-hero-section';
import { ToolFeaturesSection } from './tool-features-section';
import { TestimonialsSection } from './testimonials-section';
import { CTASection } from './cta-section';
import { AnimatedContainer, AnimatedButton } from '@/components/ui/animated-container';
import { LanguageSelector } from '@/components/ui/language-selector';

export function EnhancedLandingPage() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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
    { label: t('nav.features'), href: 'features' },
    { label: t('nav.testimonials'), href: 'testimonials' },
    { label: t('nav.pricing'), href: 'pricing' },
    { label: t('nav.contact'), href: 'contact' }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md border-b shadow-sm'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <AnimatedContainer animation="fadeInLeft">
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.6 }}
                >
                  <Shield className="w-5 h-5 text-white" />
                </motion.div>
                <span className="font-bold text-xl">ToolUnlock</span>
              </motion.div>
            </AnimatedContainer>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                    onClick={() => scrollToSection(item.href)}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <LanguageSelector />
                
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
                  {t('nav.signIn')}
                </AnimatedButton>

                <AnimatedButton
                  size="sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('nav.getStarted')}
                </AnimatedButton>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSelector />
              
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

          {/* Mobile Navigation */}
          <motion.div
            className={`md:hidden overflow-hidden ${
              isMenuOpen ? 'border-t bg-background' : ''
            }`}
            initial={{ height: 0 }}
            animate={{ height: isMenuOpen ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="py-4 space-y-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => scrollToSection(item.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {item.label}
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
                  {t('nav.signIn')}
                </AnimatedButton>
                <AnimatedButton
                  size="sm"
                  className="flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('nav.getStarted')}
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main>
        <EnhancedHeroSection />
        <div id="features">
          <ToolFeaturesSection />
        </div>
        <div id="testimonials">
          <TestimonialsSection />
        </div>
        <CTASection />
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company */}
            <div className="space-y-4">
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.6 }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </motion.div>
                <span className="font-bold text-xl">ToolUnlock</span>
              </motion.div>
              <p className="text-gray-300 text-sm">
                {t('hero.description')}
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
                    className="text-gray-400 hover:text-white transition-colors"
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
              <h3 className="font-semibold text-white">{t('footer.product')}</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { key: 'features', label: t('footer.features') },
                  { key: 'pricing', label: t('footer.pricing') },
                  { key: 'security', label: t('footer.security') },
                  { key: 'updates', label: t('footer.updates') }
                ].map((item, index) => (
                  <motion.li key={item.key}>
                    <motion.a
                      href="#"
                      className="text-gray-300 hover:text-white transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      {item.label}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">{t('footer.company')}</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { key: 'about', label: t('footer.about') },
                  { key: 'blog', label: t('footer.blog') },
                  { key: 'careers', label: t('footer.careers') },
                  { key: 'contact', label: t('footer.contact') }
                ].map((item, index) => (
                  <motion.li key={item.key}>
                    <motion.a
                      href="#"
                      className="text-gray-300 hover:text-white transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      {item.label}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">{t('footer.legal')}</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { key: 'privacy', label: t('footer.privacy') },
                  { key: 'terms', label: t('footer.terms') },
                  { key: 'cookies', label: t('footer.cookies') },
                  { key: 'licenses', label: t('footer.licenses') }
                ].map((item, index) => (
                  <motion.li key={item.key}>
                    <motion.a
                      href="#"
                      className="text-gray-300 hover:text-white transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      {item.label}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats and Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-8">
                {[
                  { icon: Star, label: t('stats.activeTools'), value: '2,500+' },
                  { icon: Shield, label: t('stats.successRate'), value: '99.9%' },
                  { icon: Zap, label: t('stats.supportResponse'), value: '< 2min' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <stat.icon className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium border border-green-500/30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>{t('testimonials.trustedBy')}</span>
              </motion.div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}