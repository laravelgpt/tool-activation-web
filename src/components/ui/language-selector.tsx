'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/language-context';
import { Language } from '@/lib/i18n';

export function LanguageSelector() {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 px-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">
            {availableLanguages[currentLanguage].flag}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-48 p-0" 
        align="end"
        sideOffset={8}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid gap-1 p-2">
            {Object.entries(availableLanguages).map(([code, config]) => (
              <motion.button
                key={code}
                className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors ${
                  currentLanguage === code
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleLanguageChange(code as Language)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{config.flag}</span>
                <span className="flex-1 text-left">{config.name}</span>
                {currentLanguage === code && (
                  <motion.div
                    className="w-2 h-2 bg-current rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}