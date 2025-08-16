export const languages = {
  en: {
    name: 'English',
    flag: '🇺🇸'
  },
  es: {
    name: 'Español',
    flag: '🇪🇸'
  },
  fr: {
    name: 'Français',
    flag: '🇫🇷'
  },
  de: {
    name: 'Deutsch',
    flag: '🇩🇪'
  },
  zh: {
    name: '中文',
    flag: '🇨🇳'
  },
  ja: {
    name: '日本語',
    flag: '🇯🇵'
  },
  pt: {
    name: 'Português',
    flag: '🇵🇹'
  },
  ru: {
    name: 'Русский',
    flag: '🇷🇺'
  }
} as const;

export type Language = keyof typeof languages;

export const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      features: 'Features',
      testimonials: 'Testimonials',
      pricing: 'Pricing',
      contact: 'Contact',
      signIn: 'Sign In',
      getStarted: 'Get Started',
      signUp: 'Sign Up'
    },
    // Hero Section
    hero: {
      title: 'Unlock Premium Tools Instantly',
      subtitle: 'Access the world\'s most powerful software tools with our advanced unlocking platform',
      description: 'Secure, fast, and reliable tool activation for professionals and enterprises',
      cta: 'Start Unlocking',
      demo: 'Watch Demo',
      trustedBy: 'Trusted by 100,000+ Users',
      popularTools: 'Popular Tools Available'
    },
    // Features
    features: {
      title: 'Everything You Need to Unlock Success',
      subtitle: 'Our comprehensive platform provides everything you need to unlock, manage, and optimize your premium tools',
      instantActivation: 'Instant Tool Activation',
      instantActivationDesc: 'Unlock premium tools instantly with our advanced activation system. No waiting, immediate access.',
      militarySecurity: 'Military-Grade Security',
      militarySecurityDesc: 'Bank-level encryption protects your tools and data. Advanced security protocols ensure complete safety.',
      lightningPerformance: 'Lightning Performance',
      lightningPerformanceDesc: 'Optimized for speed and efficiency. Tools run at peak performance with zero lag or delays.',
      globalAccess: 'Global Access',
      globalAccessDesc: 'Access your tools from anywhere in the world. Global CDN ensures fast access regardless of location.',
      teamCollaboration: 'Team Collaboration',
      teamCollaborationDesc: 'Share and manage tools across your team. Advanced permission controls for seamless collaboration.',
      cloudIntegration: 'Cloud Integration',
      cloudIntegrationDesc: 'Seamless cloud backup and sync. Your tools are always available and up to date across all devices.'
    },
    // Tool Categories
    categories: {
      title: 'Available Tool Categories',
      developmentTools: 'Development Tools',
      developmentToolsDesc: 'IDEs, compilers, debuggers, and development utilities',
      mobileTools: 'Mobile Tools',
      mobileToolsDesc: 'iOS and Android development and testing tools',
      databaseTools: 'Database Tools',
      databaseToolsDesc: 'Database management, optimization, and analytics tools',
      networkTools: 'Network Tools',
      networkToolsDesc: 'Network monitoring, security, and optimization tools',
      securityTools: 'Security Tools',
      securityToolsDesc: 'Penetration testing, encryption, and security analysis',
      premiumSoftware: 'Premium Software',
      premiumSoftwareDesc: 'Adobe, Microsoft, Autodesk and other premium software'
    },
    // Stats
    stats: {
      activeTools: 'Active Tools',
      happyUsers: 'Happy Users',
      successRate: 'Success Rate',
      supportResponse: 'Support Response'
    },
    // Testimonials
    testimonials: {
      title: 'Loved by Thousands',
      subtitle: 'Join thousands of satisfied users who have transformed their workflow with our platform',
      trustedBy: 'Trusted by industry leaders worldwide'
    },
    // CTA
    cta: {
      title: 'Ready to Transform Your Workflow?',
      subtitle: 'Join thousands of teams already using our platform to boost productivity and collaboration',
      startTrial: 'Start Free Trial',
      scheduleDemo: 'Schedule Demo',
      features: 'Features',
      benefits: {
        freeTrial: '14-day free trial',
        noCreditCard: 'No credit card required',
        cancelAnytime: 'Cancel anytime',
        support247: '24/7 support'
      },
      secure: 'Secure',
      fast: 'Fast',
      reliable: 'Reliable',
      scalable: 'Scalable'
    },
    // Footer
    footer: {
      product: 'Product',
      features: 'Features',
      pricing: 'Pricing',
      security: 'Security',
      updates: 'Updates',
      company: 'Company',
      about: 'About',
      blog: 'Blog',
      careers: 'Careers',
      contact: 'Contact',
      legal: 'Legal',
      privacy: 'Privacy',
      terms: 'Terms',
      cookies: 'Cookies',
      licenses: 'Licenses',
      copyright: '© 2024 Platform. All rights reserved.'
    },
    // Auth
    auth: {
      welcome: 'Welcome Back',
      signIn: 'Sign In to your account',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot your password?',
      createAccount: 'Create Account',
      name: 'Name',
      confirmPassword: 'Confirm Password',
      referralCode: 'Referral Code (Optional)',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...',
      passwordsMatch: "Passwords don't match"
    },
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      tryAgain: 'Try Again',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      help: 'Help',
      about: 'About'
    }
  },
  es: {
    // Navigation
    nav: {
      home: 'Inicio',
      features: 'Características',
      testimonials: 'Testimonios',
      pricing: 'Precios',
      contact: 'Contacto',
      signIn: 'Iniciar Sesión',
      getStarted: 'Comenzar',
      signUp: 'Registrarse'
    },
    // Hero Section
    hero: {
      title: 'Desbloquea Herramientas Premium Instantáneamente',
      subtitle: 'Accede a las herramientas de software más potentes del mundo con nuestra plataforma de desbloqueo avanzada',
      description: 'Activación de herramientas segura, rápida y confiable para profesionales y empresas',
      cta: 'Comenzar a Desbloquear',
      demo: 'Ver Demo',
      trustedBy: 'Confiado por 100,000+ Usuarios',
      popularTools: 'Herramientas Populares Disponibles'
    },
    // Features
    features: {
      title: 'Todo lo que Necesitas para el Éxito',
      subtitle: 'Nuestra plataforma integral proporciona todo lo que necesitas para desbloquear, gestionar y optimizar tus herramientas premium',
      instantActivation: 'Activación Instantánea de Herramientas',
      instantActivationDesc: 'Desbloquea herramientas premium instantáneamente con nuestro sistema de activación avanzado. Sin espera, acceso inmediato.',
      militarySecurity: 'Seguridad de Grado Militar',
      militarySecurityDesc: 'Cifrado de nivel bancario protege tus herramientas y datos. Protocolos de seguridad avanzados aseguran completa seguridad.',
      lightningPerformance: 'Rendimiento Relámpago',
      lightningPerformanceDesc: 'Optimizado para velocidad y eficiencia. Las herramientas funcionan con máximo rendimiento sin retrasos ni demoras.',
      globalAccess: 'Acceso Global',
      globalAccessDesc: 'Accede a tus herramientas desde cualquier parte del mundo. CDN global asegura acceso rápido sin importar la ubicación.',
      teamCollaboration: 'Colaboración en Equipo',
      teamCollaborationDesc: 'Comparte y gestiona herramientas en tu equipo. Controles de permisos avanzados para colaboración sin problemas.',
      cloudIntegration: 'Integración en la Nube',
      cloudIntegrationDesc: 'Copia de seguridad y sincronización perfecta en la nube. Tus herramientas siempre están disponibles y actualizadas en todos los dispositivos.'
    },
    // Tool Categories
    categories: {
      title: 'Categorías de Herramientas Disponibles',
      developmentTools: 'Herramientas de Desarrollo',
      developmentToolsDesc: 'IDEs, compiladores, depuradores y utilidades de desarrollo',
      mobileTools: 'Herramientas Móviles',
      mobileToolsDesc: 'Herramientas de desarrollo y pruebas para iOS y Android',
      databaseTools: 'Herramientas de Base de Datos',
      databaseToolsDesc: 'Gestión, optimización y herramientas analíticas de bases de datos',
      networkTools: 'Herramientas de Red',
      networkToolsDesc: 'Monitoreo de red, seguridad y herramientas de optimización',
      securityTools: 'Herramientas de Seguridad',
      securityToolsDesc: 'Pruebas de penetración, cifrado y análisis de seguridad',
      premiumSoftware: 'Software Premium',
      premiumSoftwareDesc: 'Adobe, Microsoft, Autodesk y otro software premium'
    },
    // Stats
    stats: {
      activeTools: 'Herramientas Activas',
      happyUsers: 'Usuarios Felices',
      successRate: 'Tasa de Éxito',
      supportResponse: 'Respuesta de Soporte'
    },
    // Testimonials
    testimonials: {
      title: 'Amado por Miles',
      subtitle: 'Únete a miles de usuarios satisfechos que han transformado su flujo de trabajo con nuestra plataforma',
      trustedBy: 'Confiado por líderes de la industria en todo el mundo'
    },
    // CTA
    cta: {
      title: '¿Listo para Transformar tu Flujo de Trabajo?',
      subtitle: 'Únete a miles de equipos que ya usan nuestra plataforma para mejorar la productividad y colaboración',
      startTrial: 'Comenzar Prueba Gratuita',
      scheduleDemo: 'Agendar Demo',
      features: 'Características',
      benefits: {
        freeTrial: 'Prueba gratuita de 14 días',
        noCreditCard: 'No se requiere tarjeta de crédito',
        cancelAnytime: 'Cancela cuando quieras',
        support247: 'Soporte 24/7'
      },
      secure: 'Seguro',
      fast: 'Rápido',
      reliable: 'Confiable',
      scalable: 'Escalable'
    },
    // Footer
    footer: {
      product: 'Producto',
      features: 'Características',
      pricing: 'Precios',
      security: 'Seguridad',
      updates: 'Actualizaciones',
      company: 'Empresa',
      about: 'Acerca de',
      blog: 'Blog',
      careers: 'Carreras',
      contact: 'Contacto',
      legal: 'Legal',
      privacy: 'Privacidad',
      terms: 'Términos',
      cookies: 'Cookies',
      licenses: 'Licencias',
      copyright: '© 2024 Platform. Todos los derechos reservados.'
    },
    // Auth
    auth: {
      welcome: 'Bienvenido de Vuelta',
      signIn: 'Inicia Sesión en tu cuenta',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      createAccount: 'Crear Cuenta',
      name: 'Nombre',
      confirmPassword: 'Confirmar Contraseña',
      referralCode: 'Código de Referido (Opcional)',
      signingIn: 'Iniciando sesión...',
      creatingAccount: 'Creando cuenta...',
      passwordsMatch: 'Las contraseñas no coinciden'
    },
    // Common
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      tryAgain: 'Intentar de Nuevo',
      close: 'Cerrar',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      export: 'Exportar',
      import: 'Importar',
      refresh: 'Actualizar',
      settings: 'Configuración',
      profile: 'Perfil',
      logout: 'Cerrar Sesión',
      help: 'Ayuda',
      about: 'Acerca de'
    }
  },
  fr: {
    // Navigation
    nav: {
      home: 'Accueil',
      features: 'Fonctionnalités',
      testimonials: 'Témoignages',
      pricing: 'Tarifs',
      contact: 'Contact',
      signIn: 'Se Connecter',
      getStarted: 'Commencer',
      signUp: 'S\'inscrire'
    },
    // Hero Section
    hero: {
      title: 'Débloquez des Outils Premium Instantanément',
      subtitle: 'Accédez aux outils logiciels les plus puissants du monde avec notre plateforme de déverrouillage avancée',
      description: 'Activation d\'outils sécurisée, rapide et fiable pour les professionnels et les entreprises',
      cta: 'Commencer à Débloquer',
      demo: 'Voir la Démo',
      trustedBy: 'Approuvé par 100 000+ Utilisateurs',
      popularTools: 'Outils Populaires Disponibles'
    },
    // Features
    features: {
      title: 'Tout ce dont vous avez besoin pour réussir',
      subtitle: 'Notre plateforme complète fournit tout ce dont vous avez besoin pour débloquer, gérer et optimiser vos outils premium',
      instantActivation: 'Activation Instantanée des Outils',
      instantActivationDesc: 'Débloquez des outils premium instantanément avec notre système d\'activation avancé. Pas d\'attente, accès immédiat.',
      militarySecurity: 'Sécurité de Niveau Militaire',
      militarySecurityDesc: 'Le chiffrement de niveau bancaire protège vos outils et vos données. Des protocoles de sécurité avancés assurent une sécurité complète.',
      lightningPerformance: 'Performance Éclair',
      lightningPerformanceDesc: 'Optimisé pour la vitesse et l\'efficacité. Les outils fonctionnent à des performances de pointe sans délai ni latence.',
      globalAccess: 'Accès Mondial',
      globalAccessDesc: 'Accédez à vos outils depuis n\'importe où dans le monde. Le CDN mondial garantit un accès rapide quelle que soit la localisation.',
      teamCollaboration: 'Collaboration d\'Équipe',
      teamCollaborationDesc: 'Partagez et gérez des outils dans votre équipe. Contrôles d\'autorisation avancés pour une collaboration sans faille.',
      cloudIntegration: 'Intégration Cloud',
      cloudIntegrationDesc: 'Sauvegarde et synchronisation cloud transparentes. Vos outils sont toujours disponibles et à jour sur tous les appareils.'
    },
    // Tool Categories
    categories: {
      title: 'Catégories d\'Outils Disponibles',
      developmentTools: 'Outils de Développement',
      developmentToolsDesc: 'IDEs, compilateurs, débogueurs et utilitaires de développement',
      mobileTools: 'Outils Mobiles',
      mobileToolsDesc: 'Outils de développement et de tests iOS et Android',
      databaseTools: 'Outils de Base de Données',
      databaseToolsDesc: 'Outils de gestion, d\'optimisation et d\'analyse de bases de données',
      networkTools: 'Outils Réseau',
      networkToolsDesc: 'Outils de surveillance réseau, sécurité et optimisation',
      securityTools: 'Outils de Sécurité',
      securityToolsDesc: 'Tests de pénétration, chiffrement et analyse de sécurité',
      premiumSoftware: 'Logiciels Premium',
      premiumSoftwareDesc: 'Adobe, Microsoft, Autodesk et autres logiciels premium'
    },
    // Stats
    stats: {
      activeTools: 'Outils Actifs',
      happyUsers: 'Utilisateurs Satisfaits',
      successRate: 'Taux de Réussite',
      supportResponse: 'Réponse Support'
    },
    // Testimonials
    testimonials: {
      title: 'Approuvé par des Milliers',
      subtitle: 'Rejoignez des milliers d\'utilisateurs satisfaits qui ont transformé leur flux de travail avec notre plateforme',
      trustedBy: 'Approuvé par les leaders de l\'industrie mondiale'
    },
    // CTA
    cta: {
      title: 'Prêt à Transformer Votre Flux de Travail ?',
      subtitle: 'Rejoignez des milliers d\'équipes utilisant déjà notre plateforme pour améliorer la productivité et la collaboration',
      startTrial: 'Commencer l\'Essai Gratuit',
      scheduleDemo: 'Planifier une Démo',
      features: 'Fonctionnalités',
      benefits: {
        freeTrial: 'Essai gratuit de 14 jours',
        noCreditCard: 'Aucune carte de crédit requise',
        cancelAnytime: 'Annulez à tout moment',
        support247: 'Support 24/7'
      },
      secure: 'Sécurisé',
      fast: 'Rapide',
      reliable: 'Fiable',
      scalable: 'Évolutif'
    },
    // Footer
    footer: {
      product: 'Produit',
      features: 'Fonctionnalités',
      pricing: 'Tarifs',
      security: 'Sécurité',
      updates: 'Mises à jour',
      company: 'Entreprise',
      about: 'À Propos',
      blog: 'Blog',
      careers: 'Carrières',
      contact: 'Contact',
      legal: 'Légal',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      cookies: 'Cookies',
      licenses: 'Licences',
      copyright: '© 2024 Platform. Tous droits réservés.'
    },
    // Auth
    auth: {
      welcome: 'Bon Retour',
      signIn: 'Connectez-vous à votre compte',
      email: 'Email',
      password: 'Mot de Passe',
      forgotPassword: 'Mot de passe oublié ?',
      createAccount: 'Créer un Compte',
      name: 'Nom',
      confirmPassword: 'Confirmer le Mot de Passe',
      referralCode: 'Code de Parrainage (Optionnel)',
      signingIn: 'Connexion...',
      creatingAccount: 'Création du compte...',
      passwordsMatch: 'Les mots de passe ne correspondent pas'
    },
    // Common
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      tryAgain: 'Réessayer',
      close: 'Fermer',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      export: 'Exporter',
      import: 'Importer',
      refresh: 'Actualiser',
      settings: 'Paramètres',
      profile: 'Profil',
      logout: 'Déconnexion',
      help: 'Aide',
      about: 'À Propos'
    }
  },
  de: {
    // Navigation
    nav: {
      home: 'Startseite',
      features: 'Funktionen',
      testimonials: 'Bewertungen',
      pricing: 'Preise',
      contact: 'Kontakt',
      signIn: 'Anmelden',
      getStarted: 'Loslegen',
      signUp: 'Registrieren'
    },
    // Hero Section
    hero: {
      title: 'Schalten Sie Premium-Tools Sofort Frei',
      subtitle: 'Zugriff auf die leistungsstärksten Software-Tools der Welt mit unserer erweiterten Freischaltplattform',
      description: 'Sichere, schnelle und zuverlässige Tool-Aktivierung für Profis und Unternehmen',
      cta: 'Freischalten Starten',
      demo: 'Demo Ansehen',
      trustedBy: 'Vertraut von 100.000+ Nutzern',
      popularTools: 'Beliebte Tools Verfügbar'
    },
    // Features
    features: {
      title: 'Alles, was Sie für den Erfolg brauchen',
      subtitle: 'Unsere umfassende Plattform bietet alles, was Sie zum Freischalten, Verwalten und Optimieren Ihrer Premium-Tools benötigen',
      instantActivation: 'Sofortige Tool-Aktivierung',
      instantActivationDesc: 'Schalten Sie Premium-Tools sofort mit unserem erweiterten Aktivierungssystem frei. Kein Warten, sofortiger Zugriff.',
      militarySecurity: 'Militärische Sicherheit',
      militarySecurityDesc: 'Bankverschlüsselung schützt Ihre Tools und Daten. Erweiterte Sicherheitsprotokolle gewährleisten vollständige Sicherheit.',
      lightningPerformance: 'Blitzleistung',
      lightningPerformanceDesc: 'Optimiert für Geschwindigkeit und Effizienz. Tools laufen mit Höchstleistung ohne Verzögerung oder Latenz.',
      globalAccess: 'Globaler Zugriff',
      globalAccessDesc: 'Zugriff auf Ihre Tools von überall auf der Welt. Globales CDN sorgt für schnellen Zugriff unabhängig vom Standort.',
      teamCollaboration: 'Team-Zusammenarbeit',
      teamCollaborationDesc: 'Teilen und verwalten Sie Tools in Ihrem Team. Erweiterte Berechtigungssteuerungen für nahtlose Zusammenarbeit.',
      cloudIntegration: 'Cloud-Integration',
      cloudIntegrationDesc: 'Nahtlose Cloud-Sicherung und -Synchronisation. Ihre Tools sind immer verfügbar und auf allen Geräten aktuell.'
    },
    // Tool Categories
    categories: {
      title: 'Verfügbare Tool-Kategorien',
      developmentTools: 'Entwicklungstools',
      developmentToolsDesc: 'IDEs, Compiler, Debugger und Entwicklungsdienstprogramme',
      mobileTools: 'Mobile Tools',
      mobileToolsDesc: 'iOS- und Android-Entwicklungs- und Testtools',
      databaseTools: 'Datenbank-Tools',
      databaseToolsDesc: 'Datenbankverwaltung, -optimierung und Analysetools',
      networkTools: 'Netzwerk-Tools',
      networkToolsDesc: 'Netzwerküberwachung, -sicherheit und -optimierungstools',
      securityTools: 'Sicherheitstools',
      securityToolsDesc: 'Penetrationstests, Verschlüsselung und Sicherheitsanalyse',
      premiumSoftware: 'Premium-Software',
      premiumSoftwareDesc: 'Adobe, Microsoft, Autodesk und andere Premium-Software'
    },
    // Stats
    stats: {
      activeTools: 'Aktive Tools',
      happyUsers: 'Zufriedene Nutzer',
      successRate: 'Erfolgsquote',
      supportResponse: 'Support-Antwort'
    },
    // Testimonials
    testimonials: {
      title: 'Von Tausenden Geliebt',
      subtitle: 'Schließen Sie sich Tausenden zufriedener Nutzer an, die ihren Workflow mit unserer Plattform transformiert haben',
      trustedBy: 'Vertraut von Branchenführern weltweit'
    },
    // CTA
    cta: {
      title: 'Bereit, Ihren Workflow zu Transformieren?',
      subtitle: 'Schließen Sie sich Tausenden von Teams an, die bereits unsere Plattform nutzen, um Produktivität und Zusammenarbeit zu verbessern',
      startTrial: 'Kostenlose Testversion Starten',
      scheduleDemo: 'Demo Planen',
      features: 'Funktionen',
      benefits: {
        freeTrial: '14-tägige kostenlose Testversion',
        noCreditCard: 'Keine Kreditkarte erforderlich',
        cancelAnytime: 'Jederzeit kündbar',
        support247: '24/7-Support'
      },
      secure: 'Sicher',
      fast: 'Schnell',
      reliable: 'Zuverlässig',
      scalable: 'Skalierbar'
    },
    // Footer
    footer: {
      product: 'Produkt',
      features: 'Funktionen',
      pricing: 'Preise',
      security: 'Sicherheit',
      updates: 'Updates',
      company: 'Unternehmen',
      about: 'Über Uns',
      blog: 'Blog',
      careers: 'Karriere',
      contact: 'Kontakt',
      legal: 'Rechtliches',
      privacy: 'Datenschutz',
      terms: 'AGB',
      cookies: 'Cookies',
      licenses: 'Lizenzen',
      copyright: '© 2024 Platform. Alle Rechte vorbehalten.'
    },
    // Auth
    auth: {
      welcome: 'Willkommen Zurück',
      signIn: 'Melden Sie sich bei Ihrem Konto an',
      email: 'E-Mail',
      password: 'Passwort',
      forgotPassword: 'Passwort vergessen?',
      createAccount: 'Konto Erstellen',
      name: 'Name',
      confirmPassword: 'Passwort Bestätigen',
      referralCode: 'Empfehlungscode (Optional)',
      signingIn: 'Anmeldung...',
      creatingAccount: 'Konto wird erstellt...',
      passwordsMatch: 'Passwörter stimmen nicht überein'
    },
    // Common
    common: {
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      tryAgain: 'Erneut Versuchen',
      close: 'Schließen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      view: 'Anzeigen',
      search: 'Suchen',
      filter: 'Filtern',
      sort: 'Sortieren',
      export: 'Exportieren',
      import: 'Importieren',
      refresh: 'Aktualisieren',
      settings: 'Einstellungen',
      profile: 'Profil',
      logout: 'Abmelden',
      help: 'Hilfe',
      about: 'Über Uns'
    }
  },
  zh: {
    // Navigation
    nav: {
      home: '首页',
      features: '功能',
      testimonials: '用户评价',
      pricing: '价格',
      contact: '联系',
      signIn: '登录',
      getStarted: '开始',
      signUp: '注册'
    },
    // Hero Section
    hero: {
      title: '立即解锁高级工具',
      subtitle: '通过我们先进的解锁平台访问全球最强大的软件工具',
      description: '为专业人士和企业提供安全、快速、可靠的工具激活服务',
      cta: '开始解锁',
      demo: '观看演示',
      trustedBy: '100,000+ 用户信赖',
      popularTools: '可用热门工具'
    },
    // Features
    features: {
      title: '解锁成功所需的一切',
      subtitle: '我们的综合平台提供解锁、管理和优化高级工具所需的一切',
      instantActivation: '即时工具激活',
      instantActivationDesc: '使用我们的高级激活系统即时解锁高级工具。无需等待，立即访问。',
      militarySecurity: '军用级安全',
      militarySecurityDesc: '银行级加密保护您的工具和数据。高级安全协议确保完全安全。',
      lightningPerformance: '闪电性能',
      lightningPerformanceDesc: '为速度和效率而优化。工具以峰值性能运行，零延迟或延迟。',
      globalAccess: '全球访问',
      globalAccessDesc: '从世界任何地方访问您的工具。全球CDN确保无论位置如何都能快速访问。',
      teamCollaboration: '团队协作',
      teamCollaborationDesc: '在团队中共享和管理工具。高级权限控制实现无缝协作。',
      cloudIntegration: '云集成',
      cloudIntegrationDesc: '无缝云备份和同步。您的工具在所有设备上始终可用且最新。'
    },
    // Tool Categories
    categories: {
      title: '可用工具类别',
      developmentTools: '开发工具',
      developmentToolsDesc: 'IDE、编译器、调试器和开发实用程序',
      mobileTools: '移动工具',
      mobileToolsDesc: 'iOS和Android开发和测试工具',
      databaseTools: '数据库工具',
      databaseToolsDesc: '数据库管理、优化和分析工具',
      networkTools: '网络工具',
      networkToolsDesc: '网络监控、安全和优化工具',
      securityTools: '安全工具',
      securityToolsDesc: '渗透测试、加密和安全分析',
      premiumSoftware: '高级软件',
      premiumSoftwareDesc: 'Adobe、Microsoft、Autodesk和其他高级软件'
    },
    // Stats
    stats: {
      activeTools: '活跃工具',
      happyUsers: '满意用户',
      successRate: '成功率',
      supportResponse: '支持响应'
    },
    // Testimonials
    testimonials: {
      title: '数千用户喜爱',
      subtitle: '加入数千名使用我们平台转变工作流程的满意用户',
      trustedBy: '全球行业领导者信赖'
    },
    // CTA
    cta: {
      title: '准备改变您的工作流程？',
      subtitle: '加入已经使用我们平台提高生产力和协作的数千个团队',
      startTrial: '开始免费试用',
      scheduleDemo: '安排演示',
      features: '功能',
      benefits: {
        freeTrial: '14天免费试用',
        noCreditCard: '无需信用卡',
        cancelAnytime: '随时取消',
        support247: '24/7支持'
      },
      secure: '安全',
      fast: '快速',
      reliable: '可靠',
      scalable: '可扩展'
    },
    // Footer
    footer: {
      product: '产品',
      features: '功能',
      pricing: '价格',
      security: '安全',
      updates: '更新',
      company: '公司',
      about: '关于',
      blog: '博客',
      careers: '职业',
      contact: '联系',
      legal: '法律',
      privacy: '隐私',
      terms: '条款',
      cookies: 'Cookie',
      licenses: '许可证',
      copyright: '© 2024 Platform. 版权所有。'
    },
    // Auth
    auth: {
      welcome: '欢迎回来',
      signIn: '登录您的账户',
      email: '邮箱',
      password: '密码',
      forgotPassword: '忘记密码？',
      createAccount: '创建账户',
      name: '姓名',
      confirmPassword: '确认密码',
      referralCode: '推荐码（可选）',
      signingIn: '登录中...',
      creatingAccount: '创建账户中...',
      passwordsMatch: '密码不匹配'
    },
    // Common
    common: {
      loading: '加载中...',
      error: '错误',
      success: '成功',
      tryAgain: '重试',
      close: '关闭',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      view: '查看',
      search: '搜索',
      filter: '筛选',
      sort: '排序',
      export: '导出',
      import: '导入',
      refresh: '刷新',
      settings: '设置',
      profile: '个人资料',
      logout: '退出',
      help: '帮助',
      about: '关于'
    }
  },
  ja: {
    // Navigation
    nav: {
      home: 'ホーム',
      features: '機能',
      testimonials: 'お客様の声',
      pricing: '価格',
      contact: 'お問い合わせ',
      signIn: 'ログイン',
      getStarted: '始める',
      signUp: 'サインアップ'
    },
    // Hero Section
    hero: {
      title: 'プレミアムツールを即時アンロック',
      subtitle: '当社の高度なアンロックプラットフォームで世界最強のソフトウェアツールにアクセス',
      description: 'プロフェッショナルと企業のための安全、高速、信頼性の高いツールアクティベーション',
      cta: 'アンロックを開始',
      demo: 'デモを見る',
      trustedBy: '100,000+ ユーザーに信頼',
      popularTools: '利用可能な人気ツール'
    },
    // Features
    features: {
      title: '成功に必要なすべて',
      subtitle: '当社の包括的なプラットフォームは、プレミアムツールのアンロック、管理、最適化に必要なすべてを提供します',
      instantActivation: '即時ツールアクティベーション',
      instantActivationDesc: '当社の高度なアクティベーションシステムでプレミアムツールを即時にアンロック。待ち時間なし、即時アクセス。',
      militarySecurity: 'ミリタリーグレードセキュリティ',
      militarySecurityDesc: '銀行レベルの暗号化がツールとデータを保護。高度なセキュリティプロトコルで完全な安全性を確保。',
      lightningPerformance: 'ライトニングパフォーマンス',
      lightningPerformanceDesc: '速度と効率のために最適化。ツールは遅延や遅れなしに最高パフォーマンスで実行。',
      globalAccess: 'グローバルアクセス',
      globalAccessDesc: '世界中どこからでもツールにアクセス。グローバルCDNで場所に関係なく高速アクセスを確保。',
      teamCollaboration: 'チームコラボレーション',
      teamCollaborationDesc: 'チームでツールを共有・管理。シームレスなコラボレーションのための高度な権限管理。',
      cloudIntegration: 'クラウド統合',
      cloudIntegrationDesc: 'シームレスなクラウドバックアップと同期。ツールはすべてのデバイスで常に利用可能で最新。'
    },
    // Tool Categories
    categories: {
      title: '利用可能なツールカテゴリ',
      developmentTools: '開発ツール',
      developmentToolsDesc: 'IDE、コンパイラ、デバッガ、開発ユーティリティ',
      mobileTools: 'モバイルツール',
      mobileToolsDesc: 'iOSおよびAndroid開発・テストツール',
      databaseTools: 'データベースツール',
      databaseToolsDesc: 'データベース管理、最適化、分析ツール',
      networkTools: 'ネットワークツール',
      networkToolsDesc: 'ネットワーク監視、セキュリティ、最適化ツール',
      securityTools: 'セキュリティツール',
      securityToolsDesc: 'ペネトレーションテスト、暗号化、セキュリティ分析',
      premiumSoftware: 'プレミアムソフトウェア',
      premiumSoftwareDesc: 'Adobe、Microsoft、Autodeskおよびその他のプレミアムソフトウェア'
    },
    // Stats
    stats: {
      activeTools: 'アクティブツール',
      happyUsers: '満足ユーザー',
      successRate: '成功率',
      supportResponse: 'サポート応答'
    },
    // Testimonials
    testimonials: {
      title: '数千人に愛用',
      subtitle: '当社のプラットフォームでワークフローを変革した満足ユーザーの仲間に加わりましょう',
      trustedBy: '世界中の業界リーダーに信頼'
    },
    // CTA
    cta: {
      title: 'ワークフローを変革する準備はできましたか？',
      subtitle: '生産性とコラボレーションを向上させるため当社のプラットフォームを既に利用している数千のチームに加わりましょう',
      startTrial: '無料トライアルを開始',
      scheduleDemo: 'デモを予約',
      features: '機能',
      benefits: {
        freeTrial: '14日間の無料トライアル',
        noCreditCard: 'クレジットカード不要',
        cancelAnytime: 'いつでもキャンセル可能',
        support247: '24/7サポート'
      },
      secure: '安全',
      fast: '高速',
      reliable: '信頼性',
      scalable: 'スケーラブル'
    },
    // Footer
    footer: {
      product: '製品',
      features: '機能',
      pricing: '価格',
      security: 'セキュリティ',
      updates: 'アップデート',
      company: '会社',
      about: 'について',
      blog: 'ブログ',
      careers: '採用情報',
      contact: 'お問い合わせ',
      legal: '法務',
      privacy: 'プライバシー',
      terms: '利用規約',
      cookies: 'クッキー',
      licenses: 'ライセンス',
      copyright: '© 2024 Platform. 全著作権所有。'
    },
    // Auth
    auth: {
      welcome: 'お帰りなさい',
      signIn: 'アカウントにログイン',
      email: 'メール',
      password: 'パスワード',
      forgotPassword: 'パスワードをお忘れですか？',
      createAccount: 'アカウント作成',
      name: '名前',
      confirmPassword: 'パスワード確認',
      referralCode: '紹介コード（任意）',
      signingIn: 'ログイン中...',
      creatingAccount: 'アカウント作成中...',
      passwordsMatch: 'パスワードが一致しません'
    },
    // Common
    common: {
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      tryAgain: '再試行',
      close: '閉じる',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      view: '表示',
      search: '検索',
      filter: 'フィルター',
      sort: '並べ替え',
      export: 'エクスポート',
      import: 'インポート',
      refresh: '更新',
      settings: '設定',
      profile: 'プロフィール',
      logout: 'ログアウト',
      help: 'ヘルプ',
      about: 'について'
    }
  },
  pt: {
    // Navigation
    nav: {
      home: 'Início',
      features: 'Recursos',
      testimonials: 'Depoimentos',
      pricing: 'Preços',
      contact: 'Contato',
      signIn: 'Entrar',
      getStarted: 'Começar',
      signUp: 'Inscrever-se'
    },
    // Hero Section
    hero: {
      title: 'Desbloqueie Ferramentas Premium Instantaneamente',
      subtitle: 'Acesse as ferramentas de software mais poderosas do mundo com nossa plataforma avançada de desbloqueio',
      description: 'Ativação de ferramentas segura, rápida e confiável para profissionais e empresas',
      cta: 'Começar a Desbloquear',
      demo: 'Ver Demo',
      trustedBy: 'Confiado por 100.000+ Usuários',
      popularTools: 'Ferramentas Populares Disponíveis'
    },
    // Features
    features: {
      title: 'Tudo o que Você Precisa para o Sucesso',
      subtitle: 'Nossa plataforma completa fornece tudo o que você precisa para desbloquear, gerenciar e otimizar suas ferramentas premium',
      instantActivation: 'Ativação Instantânea de Ferramentas',
      instantActivationDesc: 'Desbloqueie ferramentas premium instantaneamente com nosso sistema avançado de ativação. Sem espera, acesso imediato.',
      militarySecurity: 'Segurança de Nível Militar',
      militarySecurityDesc: 'Criptografia de nível bancário protege suas ferramentas e dados. Protocolos de segurança avançados garantem segurança completa.',
      lightningPerformance: 'Desempenho Relâmpago',
      lightningPerformanceDesc: 'Otimizado para velocidade e eficiência. Ferramentas funcionam com desempenho máximo sem atrasos ou latência.',
      globalAccess: 'Acesso Global',
      globalAccessDesc: 'Acesse suas ferramentas de qualquer lugar do mundo. CDN global garante acesso rápido independentemente da localização.',
      teamCollaboration: 'Colaboração em Equipe',
      teamCollaborationDesc: 'Compartilhe e gerencie ferramentas em sua equipe. Controles avançados de permissão para colaboração perfeita.',
      cloudIntegration: 'Integração na Nuvem',
      cloudIntegrationDesc: 'Backup e sincronização perfeitos na nuvem. Suas ferramentas estão sempre disponíveis e atualizadas em todos os dispositivos.'
    },
    // Tool Categories
    categories: {
      title: 'Categorias de Ferramentas Disponíveis',
      developmentTools: 'Ferramentas de Desenvolvimento',
      developmentToolsDesc: 'IDEs, compiladores, depuradores e utilitários de desenvolvimento',
      mobileTools: 'Ferramentas Móveis',
      mobileToolsDesc: 'Ferramentas de desenvolvimento e teste para iOS e Android',
      databaseTools: 'Ferramentas de Banco de Dados',
      databaseToolsDesc: 'Ferramentas de gerenciamento, otimização e análise de bancos de dados',
      networkTools: 'Ferramentas de Rede',
      networkToolsDesc: 'Ferramentas de monitoramento de rede, segurança e otimização',
      securityTools: 'Ferramentas de Segurança',
      securityToolsDesc: 'Testes de penetração, criptografia e análise de segurança',
      premiumSoftware: 'Software Premium',
      premiumSoftwareDesc: 'Adobe, Microsoft, Autodesk e outros softwares premium'
    },
    // Stats
    stats: {
      activeTools: 'Ferramentas Ativas',
      happyUsers: 'Usuários Felizes',
      successRate: 'Taxa de Sucesso',
      supportResponse: 'Resposta de Suporte'
    },
    // Testimonials
    testimonials: {
      title: 'Amado por Milhares',
      subtitle: 'Junte-se a milhares de usuários satisfeitos que transformaram seu fluxo de trabalho com nossa plataforma',
      trustedBy: 'Confiado por líderes da indústria mundial'
    },
    // CTA
    cta: {
      title: 'Pronto para Transformar seu Fluxo de Trabalho?',
      subtitle: 'Junte-se a milhares de equipes que já usam nossa plataforma para melhorar produtividade e colaboração',
      startTrial: 'Iniciar Teste Gratuito',
      scheduleDemo: 'Agendar Demo',
      features: 'Recursos',
      benefits: {
        freeTrial: 'Teste gratuito de 14 dias',
        noCreditCard: 'Não requer cartão de crédito',
        cancelAnytime: 'Cancele a qualquer momento',
        support247: 'Suporte 24/7'
      },
      secure: 'Seguro',
      fast: 'Rápido',
      reliable: 'Confiável',
      scalable: 'Escalável'
    },
    // Footer
    footer: {
      product: 'Produto',
      features: 'Recursos',
      pricing: 'Preços',
      security: 'Segurança',
      updates: 'Atualizações',
      company: 'Empresa',
      about: 'Sobre',
      blog: 'Blog',
      careers: 'Carreiras',
      contact: 'Contato',
      legal: 'Legal',
      privacy: 'Privacidade',
      terms: 'Termos',
      cookies: 'Cookies',
      licenses: 'Licenças',
      copyright: '© 2024 Platform. Todos os direitos reservados.'
    },
    // Auth
    auth: {
      welcome: 'Bem-vindo de Volta',
      signIn: 'Entre na sua conta',
      email: 'Email',
      password: 'Senha',
      forgotPassword: 'Esqueceu sua senha?',
      createAccount: 'Criar Conta',
      name: 'Nome',
      confirmPassword: 'Confirmar Senha',
      referralCode: 'Código de Indicação (Opcional)',
      signingIn: 'Entrando...',
      creatingAccount: 'Criando conta...',
      passwordsMatch: 'As senhas não coincidem'
    },
    // Common
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      tryAgain: 'Tentar Novamente',
      close: 'Fechar',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      view: 'Visualizar',
      search: 'Pesquisar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      export: 'Exportar',
      import: 'Importar',
      refresh: 'Atualizar',
      settings: 'Configurações',
      profile: 'Perfil',
      logout: 'Sair',
      help: 'Ajuda',
      about: 'Sobre'
    }
  },
  ru: {
    // Navigation
    nav: {
      home: 'Главная',
      features: 'Функции',
      testimonials: 'Отзывы',
      pricing: 'Цены',
      contact: 'Контакты',
      signIn: 'Войти',
      getStarted: 'Начать',
      signUp: 'Регистрация'
    },
    // Hero Section
    hero: {
      title: 'Мгновенно Разблокируйте Премиум Инструменты',
      subtitle: 'Получите доступ к самым мощным программным инструментам в мире с нашей продвинутой платформой разблокировки',
      description: 'Безопасная, быстрая и надежная активация инструментов для профессионалов и предприятий',
      cta: 'Начать Разблокировку',
      demo: 'Смотреть Демо',
      trustedBy: 'Доверяют 100,000+ Пользователей',
      popularTools: 'Доступные Популярные Инструменты'
    },
    // Features
    features: {
      title: 'Все Необходимое для Успеха',
      subtitle: 'Наша комплексная платформа предоставляет все необходимое для разблокировки, управления и оптимизации ваших премиум инструментов',
      instantActivation: 'Мгновенная Активация Инструментов',
      instantActivationDesc: 'Мгновенно разблокируйте премиум инструменты с нашей продвинутой системой активации. Без ожидания, немедленный доступ.',
      militarySecurity: 'Военно-Уровневая Безопасность',
      militarySecurityDesc: 'Банковское шифрование защищает ваши инструменты и данные. Продвинутые протоколы безопасности обеспечивают полную защиту.',
      lightningPerformance: 'Молниеносная Производительность',
      lightningPerformanceDesc: 'Оптимизировано для скорости и эффективности. Инструменты работают на пиковых показателях без задержек и лагов.',
      globalAccess: 'Глобальный Доступ',
      globalAccessDesc: 'Получайте доступ к вашим инструментам из любой точки мира. Глобальный CDN обеспечивает быстрый доступ независимо от местоположения.',
      teamCollaboration: 'Командная Работа',
      teamCollaborationDesc: 'Делитесь и управляйте инструментами в вашей команде. Продвинутые права доступа для беспрепятственной совместной работы.',
      cloudIntegration: 'Облачная Интеграция',
      cloudIntegrationDesc: 'Бесшовное облачное резервное копирование и синхронизация. Ваши инструменты всегда доступны и обновлены на всех устройствах.'
    },
    // Tool Categories
    categories: {
      title: 'Доступные Категории Инструментов',
      developmentTools: 'Инструменты Разработки',
      developmentToolsDesc: 'IDE, компиляторы, отладчики и утилиты разработки',
      mobileTools: 'Мобильные Инструменты',
      mobileToolsDesc: 'Инструменты разработки и тестирования для iOS и Android',
      databaseTools: 'Инструменты Баз Данных',
      databaseToolsDesc: 'Инструменты управления, оптимизации и анализа баз данных',
      networkTools: 'Сетевые Инструменты',
      networkToolsDesc: 'Инструменты мониторинга сети, безопасности и оптимизации',
      securityTools: 'Инструменты Безопасности',
      securityToolsDesc: 'Тестирование на проникновение, шифрование и анализ безопасности',
      premiumSoftware: 'Премиум Программное Обеспечение',
      premiumSoftwareDesc: 'Adobe, Microsoft, Autodesk и другое премиум ПО'
    },
    // Stats
    stats: {
      activeTools: 'Активные Инструменты',
      happyUsers: 'Довольные Пользователи',
      successRate: 'Уровень Успеха',
      supportResponse: 'Ответ Поддержки'
    },
    // Testimonials
    testimonials: {
      title: 'Любим Тысячами',
      subtitle: 'Присоединяйтесь к тысячам довольных пользователей, которые преобразовали свой рабочий процесс с нашей платформой',
      trustedBy: 'Доверяют лидеры индустрии по всему миру'
    },
    // CTA
    cta: {
      title: 'Готовы Преобразовать Ваш Рабочий Процесс?',
      subtitle: 'Присоединяйтесь к тысячам команд, уже использующих нашу платформу для повышения производительности и совместной работы',
      startTrial: 'Начать Бесплатный Пробный Период',
      scheduleDemo: 'Запланировать Демо',
      features: 'Функции',
      benefits: {
        freeTrial: '14-дневный бесплатный пробный период',
        noCreditCard: 'Не требуется кредитная карта',
        cancelAnytime: 'Отмена в любое время',
        support247: 'Поддержка 24/7'
      },
      secure: 'Безопасно',
      fast: 'Быстро',
      reliable: 'Надежно',
      scalable: 'Масштабируемо'
    },
    // Footer
    footer: {
      product: 'Продукт',
      features: 'Функции',
      pricing: 'Цены',
      security: 'Безопасность',
      updates: 'Обновления',
      company: 'Компания',
      about: 'О Нас',
      blog: 'Блог',
      careers: 'Карьера',
      contact: 'Контакты',
      legal: 'Юридическое',
      privacy: 'Конфиденциальность',
      terms: 'Условия',
      cookies: 'Файлы Cookie',
      licenses: 'Лицензии',
      copyright: '© 2024 Platform. Все права защищены.'
    },
    // Auth
    auth: {
      welcome: 'Добро Пожаловать',
      signIn: 'Войдите в свой аккаунт',
      email: 'Email',
      password: 'Пароль',
      forgotPassword: 'Забыли пароль?',
      createAccount: 'Создать Аккаунт',
      name: 'Имя',
      confirmPassword: 'Подтвердить Пароль',
      referralCode: 'Реферальный Код (Необязательно)',
      signingIn: 'Вход...',
      creatingAccount: 'Создание аккаунта...',
      passwordsMatch: 'Пароли не совпадают'
    },
    // Common
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успех',
      tryAgain: 'Попробовать Снова',
      close: 'Закрыть',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      view: 'Просмотреть',
      search: 'Поиск',
      filter: 'Фильтр',
      sort: 'Сортировка',
      export: 'Экспорт',
      import: 'Импорт',
      refresh: 'Обновить',
      settings: 'Настройки',
      profile: 'Профиль',
      logout: 'Выйти',
      help: 'Помощь',
      about: 'О Нас'
    }
  }
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(language: Language, key: string): string {
  const keys = key.split('.');
  let current: any = translations[language];
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Fallback to English if translation not found
      current = translations.en;
      for (const fallbackKey of keys) {
        if (current && typeof current === 'object' && fallbackKey in current) {
          current = current[fallbackKey];
        } else {
          return key; // Return the key itself if no translation found
        }
      }
      break;
    }
  }
  
  return typeof current === 'string' ? current : key;
}