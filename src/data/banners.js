import { unsplash } from '../lib/utils.js';

// Homepage hero slides. Swap imagery / copy here without touching HeroSlider.
export const heroBanners = [
  {
    id: 1,
    kicker: 'Curated Corporate Gifting',
    title: 'Thoughtful Gifts.\nMeaningful Connections.',
    subtitle:
      'Discover beautifully curated corporate gifts that bring people closer and make every occasion memorable.',
    primaryCta: { label: 'Shop Gifts', link: '/products' },
    secondaryCta: { label: 'Get a Quote', link: '/get-a-quote' },
    image: unsplash('photo-1549465220-1a8b9238cd48', 1920),
    accent: 'gold',
  },
  {
    id: 2,
    kicker: 'Festival Season',
    title: 'Celebrate Every Festival,\nTogether.',
    subtitle:
      'Premium Diwali and holiday hampers crafted with artisanal treats, keepsakes and your brand at the heart.',
    primaryCta: { label: 'Shop Hampers', link: '/categories/festival-hampers' },
    secondaryCta: { label: 'Get a Quote', link: '/get-a-quote' },
    image: unsplash('photo-1513885535751-8b9238bd345a', 1920),
    accent: 'green',
  },
  {
    id: 3,
    kicker: 'Onboarding & Welcome Kits',
    title: 'First Days Deserve\nSomething Special.',
    subtitle:
      'Welcome kits your new joiners will remember — curated, branded and delivered to every doorstep, pan India.',
    primaryCta: { label: 'View Welcome Kits', link: '/categories/welcome-kits' },
    secondaryCta: { label: 'Build Your Own Hamper', link: '/build-your-own-hamper' },
    image: unsplash('photo-1607082348824-0a96f2a4b9da', 1920),
    accent: 'cream',
  },
];

export default heroBanners;
