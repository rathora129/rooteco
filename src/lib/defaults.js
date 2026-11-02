export const DEFAULT_SETTINGS = {
  general: {
    siteName: 'RootEco',
    tagline: 'Thoughtful gifting for teams that care about people.',
    logoUrl: '/images/rooteco-logo.png',
    faviconUrl: '/icon.png',
    announcement: 'Thoughtful Gifting. Made Effortless.',
    announcementActive: true,
  },
  contact: {
    email: 'hello@rooteco.example.com',
    phone: '+91 90000 00000',
    whatsapp: '+91 90000 00000',
    address: 'Demo Office — Gurugram, Haryana, India',
    hours: 'Mon–Sat, 10:00–19:00 IST',
  },
  social: {
    instagram: '',
    linkedin: '',
    facebook: '',
    twitter: '',
    youtube: '',
  },
  footer: {
    description:
      'Curated corporate gifting, festival hampers and branded merchandise — delivered pan India.',
    copyright: '',
  },
  seo: {
    defaultTitle: 'RootEco — Premium Corporate Gifting',
    titleTemplate: '%s | RootEco',
    defaultDescription:
      'Thoughtful corporate gifting, festival hampers, welcome kits and branded merchandise. Curated, customized and delivered pan India.',
    keywords: 'corporate gifting, festival hampers, welcome kits, branded merchandise, India',
    ogImage: '/images/rooteco-logo.png',
    canonicalBase: 'http://localhost:3000',
    robots: 'index, follow',
    sitemapEnabled: true,
  },
  marketing: {
    ga4Id: '',
    metaPixelId: '',
    googleSiteVerification: '',
  },
  payments: {
    methods: ['bank-transfer', 'cod'],
    onlineEnabled: false,
    instructions:
      'A 50% or 100% advance is confirmed on the proforma invoice. Online payment will be enabled once the payment gateway is configured.',
  },
  whatsapp: {
    number: '919000000000',
    message:
      'Hi RootEco, I am interested in your corporate gifting products. Please share more details.',
    enabled: true,
  },
};

export const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS);
