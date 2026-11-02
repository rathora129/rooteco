import { unsplash } from '../lib/utils.js';

const categories = [
  {
    id: 1,
    slug: 'welcome-kits',
    name: 'Welcome Kits',
    tagline: 'First days, made memorable',
    description:
      'Onboarding boxes and new-joiner kits that make every employee feel valued from day one.',
    image: unsplash('photo-1607082348824-0a96f2a4b9da'),
    homeCard: true,
    subcategories: [
      { slug: 'onboarding-boxes', name: 'Onboarding Boxes' },
      { slug: 'executive-kits', name: 'Executive Kits' },
      { slug: 'remote-work-kits', name: 'Remote Work Kits' },
    ],
  },
  {
    id: 2,
    slug: 'drinkware',
    name: 'Drinkware',
    tagline: 'Sip in style, every day',
    description:
      'Premium bottles, tumblers and mugs — perfect canvases for your brand.',
    image: unsplash('photo-1601925260368-ae2f83cf8b7f'),
    homeCard: false,
    subcategories: [
      { slug: 'bottles', name: 'Bottles' },
      { slug: 'mugs-tumblers', name: 'Mugs & Tumblers' },
      { slug: 'flasks', name: 'Flasks' },
    ],
  },
  {
    id: 3,
    slug: 'tech-gadgets',
    name: 'Tech & Gadgets',
    tagline: 'Everyday tech, elevated',
    description:
      'Audio, power and desk tech that people actually use — branded beautifully.',
    image: unsplash('photo-1505740420928-5e560c06d30e'),
    homeCard: false,
    subcategories: [
      { slug: 'audio', name: 'Audio' },
      { slug: 'power-chargers', name: 'Power & Chargers' },
      { slug: 'desk-tech', name: 'Desk Tech' },
    ],
  },
  {
    id: 4,
    slug: 'bags-backpacks',
    name: 'Bags & Backpacks',
    tagline: 'Carry your brand further',
    description:
      'Backpacks, laptop bags and totes built for daily commutes and business travel.',
    image: unsplash('photo-1553062407-98eeb64c6a62'),
    homeCard: false,
    subcategories: [
      { slug: 'backpacks', name: 'Backpacks' },
      { slug: 'laptop-bags', name: 'Laptop Bags' },
      { slug: 'tote-bags', name: 'Tote Bags' },
    ],
  },
  {
    id: 5,
    slug: 'office-essentials',
    name: 'Office Essentials',
    tagline: 'Desk staples, done premium',
    description:
      'Notebooks, planners and desk accessories that bring polish to every workspace.',
    image: unsplash('photo-1499750310107-5fef28a66643'),
    homeCard: false,
    subcategories: [
      { slug: 'notebooks-stationery', name: 'Notebooks & Stationery' },
      { slug: 'desk-accessories', name: 'Desk Accessories' },
      { slug: 'planners', name: 'Planners' },
    ],
  },
  {
    id: 6,
    slug: 'eco-friendly',
    name: 'Eco-Friendly Gifts',
    tagline: 'Gifts the planet approves of',
    description:
      'Plants, recycled materials and sustainable products for conscious brands.',
    image: unsplash('photo-1463320726281-696a485928c7'),
    homeCard: true,
    subcategories: [
      { slug: 'plants', name: 'Plants' },
      { slug: 'sustainable-drinkware', name: 'Sustainable Drinkware' },
      { slug: 'recycled-stationery', name: 'Recycled Stationery' },
    ],
  },
  {
    id: 7,
    slug: 'festival-hampers',
    name: 'Festival Hampers',
    tagline: 'Festivals, celebrated together',
    description:
      'Curated Diwali, holiday and celebration hampers your teams will love.',
    image: unsplash('photo-1513885535751-8b9238bd345a'),
    homeCard: true,
    subcategories: [
      { slug: 'diwali-hampers', name: 'Diwali Hampers' },
      { slug: 'holiday-gifts', name: 'Holiday Gifts' },
      { slug: 'celebration-hampers', name: 'Celebration Hampers' },
    ],
  },
  {
    id: 8,
    slug: 'apparel',
    name: 'Apparel',
    tagline: 'Wearable brand love',
    description:
      'T-shirts, hoodies and caps crafted for comfort and printed with care.',
    image: unsplash('photo-1523381210434-271e8be1f52b'),
    homeCard: false,
    subcategories: [
      { slug: 't-shirts', name: 'T-Shirts' },
      { slug: 'hoodies', name: 'Hoodies' },
      { slug: 'caps', name: 'Caps' },
    ],
  },
  {
    id: 9,
    slug: 'premium-gift-sets',
    name: 'Premium Gift Sets',
    tagline: 'Curated. Considered. Premium.',
    description:
      'Executive sets and curated boxes for clients, leadership and milestones.',
    image: unsplash('photo-1549465220-1a8b9238cd48'),
    homeCard: true,
    subcategories: [
      { slug: 'executive-sets', name: 'Executive Sets' },
      { slug: 'curated-boxes', name: 'Curated Boxes' },
    ],
  },
  {
    id: 10,
    slug: 'customized-merchandise',
    name: 'Customized Merchandise',
    tagline: 'Your brand, on everything',
    description:
      'Fully branded merchandise programs — from concept and mock-ups to delivery.',
    image: unsplash('photo-1607083206869-4c7672e72a8a'),
    homeCard: false,
    subcategories: [
      { slug: 'branded-tech', name: 'Branded Tech' },
      { slug: 'printed-apparel', name: 'Printed Apparel' },
      { slug: 'custom-drinkware', name: 'Custom Drinkware' },
    ],
  },
];

export const getCategoryBySlug = (slug) =>
  categories.find((c) => c.slug === slug);

export const getSubcategory = (categorySlug, subcategorySlug) => {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;
  const sub = category.subcategories.find((s) => s.slug === subcategorySlug);
  return sub ? { ...sub, category } : null;
};

export default categories;
