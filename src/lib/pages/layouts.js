export const LAYOUT_LABELS = {
  'home-hero': 'Homepage hero slider',
  'logo-strip': 'Client logo strip',
  'category-grid': 'Category cards',
  'product-row': 'Product row',
  'festival-gifting': 'Festival collections',
  'process-timeline': 'Process timeline',
  'feature-split': 'Feature grid',
  'hamper-banner': 'Hamper builder banner',
  'testimonial-grid': 'Testimonials',
  'office-grid': 'Office locations',
  'editorial-swag': 'Editorial cards',
  'editorial-corporate': 'Editorial split',
  'home-faq': 'FAQ accordion',
  'about-hero': 'About hero',
  'about-story': 'Story split',
  'about-values': 'Values grid',
  'about-stats': 'Stats band',
  'about-approach': 'Approach cards',
  'about-cta': 'Closing call to action',
  'contact-hero': 'Contact hero',
  'contact-body': 'Contact form and details',
  'faq-hero': 'FAQ hero',
  'faq-body': 'FAQ list and support',
  'wall-hero': 'Wall of Love hero',
  'wall-grid': 'Review wall',
  'wall-invite': 'Review page invitation',
  'blog-hero': 'Journal hero',
  'blog-grid': 'Article grid',
  'collections-hero': 'Collections hero',
  'collection-grid': 'Collection grid',
  'legal-hero': 'Policy hero',
  'legal-intro': 'Policy introduction',
  'legal-section': 'Policy section',
  'page-hero': 'Page hero',
  'route-body': 'Route content',
  'dynamic-hero': 'Dynamic page header',
};

const block = (key, layout, type, content = {}) => ({
  key,
  type,
  heading: content.heading || '',
  body: content.body || '',
  image: content.image || '',
  data: {
    layout,
    layoutKey: key,
    ...(content.eyebrow ? { subheading: content.eyebrow } : {}),
    ...(content.data || {}),
  },
});

const routeBlock = (key, layout, type, heading, body) =>
  block(key, layout, type, { heading, body, data: { locked: true } });

const HOME = [
  block('home-hero', 'home-hero', 'hero', {
    heading: 'Homepage hero slider',
    body: 'Rotating campaign banners managed in Website Studio → Banners.',
    data: { locked: true, managedIn: 'banners', visible: true },
  }),
  block('home-trusted', 'logo-strip', 'columns', {
    heading: 'Trusted by leading teams',
    body: 'Client logo strip shown under the hero.',
    data: { locked: true },
  }),
  block('home-categories', 'category-grid', 'collection', {
    heading: 'Every kind of gift, for every occasion',
    body: 'From first-day welcome kits to festive hampers — one partner for every gifting moment.',
    eyebrow: 'What We Do',
    data: { source: 'categories' },
  }),
  block('home-featured', 'product-row', 'collection', {
    heading: 'Great employees deserve this',
    body: 'Welcome kits, tech and essentials — curated for your team.',
    eyebrow: 'Corporate Gifting',
    data: { source: 'featured', link: '/products', label: 'View all gifts', cream: true },
  }),
  block('home-festival', 'festival-gifting', 'collection', {
    heading: 'Gifts that keep conversation going',
    body: 'Festive hampers, Diwali gifting and celebration boxes — crafted for teams and clients.',
    eyebrow: 'Festival Gifting',
  }),
  block('home-new', 'product-row', 'collection', {
    heading: 'Just landed for your team',
    body: 'Fresh additions to the catalogue — ready for branding and bulk orders.',
    eyebrow: 'New Arrivals',
    data: { source: 'newArrival', link: '/products?sort=newest', cream: true },
  }),
  block('home-best', 'product-row', 'collection', {
    heading: 'Our most-loved products',
    body: 'The gifts companies reorder, year after year.',
    eyebrow: 'Best Seller',
    data: { source: 'bestSeller', link: '/products?sort=best-selling' },
  }),
  block('home-process', 'process-timeline', 'process', {
    heading: 'Process & track delivery of every order',
    body: 'In just a few easy steps — from purchase order to doorstep.',
    eyebrow: 'The Process',
  }),
  block('home-features', 'feature-split', 'columns', {
    heading: 'Everything your gifting program needs',
    body: 'One partner for design, branding, packaging and delivery — so your team can focus on the celebration.',
    eyebrow: 'All Features',
  }),
  block('home-hamper', 'hamper-banner', 'cta', {
    heading: 'Build Your Own Hamper',
    body: 'Pick a box, choose the products, add your branding — and we curate, pack and deliver a hamper that feels unmistakably yours.',
    eyebrow: 'Make it yours',
    data: { label: 'Select Products', href: '/build-your-own-hamper' },
  }),
  block('home-testimonials', 'testimonial-grid', 'quote', {
    heading: 'What our clients say',
    body: 'Stories from teams who trusted RootEco with their gifting moments.',
    eyebrow: 'Wall of Love',
  }),
  block('home-offices', 'office-grid', 'columns', {
    heading: 'Plan your in-person meet at ease across our offices',
    body: 'Demo office locations shown — addresses will be updated soon.',
    eyebrow: 'Our Offices',
  }),
  block('home-swag', 'editorial-swag', 'image', {
    heading: 'Gifting, elevated',
    eyebrow: 'RootEco is Always',
  }),
  block('home-corporate', 'editorial-corporate', 'story', {
    heading: 'Corporate Gifting Made Easy for Teams Everywhere',
    body: 'Bulk gifting, custom merchandise, employee welcome kits and client appreciation — one curated catalogue, one dedicated contact, one reliable delivery network.',
    eyebrow: 'For Teams Everywhere',
  }),
  block('home-faq', 'home-faq', 'text', {
    heading: 'Frequently Asked Questions',
    body: 'If you have any other questions, please email us at',
    eyebrow: 'Help Center',
  }),
];

const ABOUT = [
  block('about-hero', 'about-hero', 'hero', {
    heading: 'Gifting that grows with your team',
    body: "We believe a thoughtful gift can do what a thousand emails can't — make people feel seen, valued and part of something.",
    eyebrow: 'About RootEco',
  }),
  block('about-story', 'about-story', 'story', {
    heading: 'Gifts should feel personal, even at scale',
    body: "RootEco began with a simple frustration: corporate gifting often felt like a transaction — the same generic mug, the same logo, the same lack of thought. We wanted to build something better.\n\nSo we created a curated catalogue of welcome kits, hampers, tech and everyday objects — each one chosen to be genuinely useful, beautifully finished and ready to carry your brand. Then we wrapped it in a process built for real teams: clear quotes, sample approvals, quality checks and reliable delivery.",
    eyebrow: 'Our Story',
    data: { label: 'Talk to our team', href: '/get-a-quote' },
  }),
  block('about-values', 'about-values', 'columns', {
    heading: 'Thoughtful by design',
    body: 'Four principles shape everything we curate, brand and ship.',
    eyebrow: 'What we stand for',
  }),
  block('about-stats', 'about-stats', 'columns', {
    heading: 'RootEco at a glance',
    data: {
      items: [
        { value: '28', label: 'curated gifts in the demo catalogue' },
        { value: '10', label: 'gifting categories' },
        { value: '8', label: 'steps from PO to delivery' },
        { value: '1', label: 'dedicated contact per order' },
      ],
    },
  }),
  block('about-approach', 'about-approach', 'process', {
    heading: 'From brief to doorstep',
    eyebrow: 'How we work',
    data: {
      items: [
        {
          heading: 'Understand the brief',
          body: 'We start with your people, occasion, budget and timeline — not a product list. Then we propose options that actually fit.',
        },
        {
          heading: 'Build and approve',
          body: 'Branding mock-ups, samples and packaging are shared for approval before any production begins.',
        },
        {
          heading: 'Deliver with care',
          body: 'Every order is quality-checked, carefully packed and delivered across India — to one office or many.',
        },
      ],
    },
  }),
  block('about-cta', 'about-cta', 'cta', {
    heading: "Let's make your next gift unforgettable",
    body: "Tell us about your team and the moment you're celebrating. We'll take it from there.",
    data: {
      label: 'Get a Quote',
      href: '/get-a-quote',
      secondaryLabel: 'Explore Categories',
      secondaryHref: '/categories',
    },
  }),
];

const CONTACT = [
  block('contact-hero', 'contact-hero', 'hero', {
    heading: 'Contact RootEco',
    body: 'Questions about a product, a bulk order or an existing delivery? Send a note and our gifting team will get back within one business day.',
    eyebrow: "We're here to help",
  }),
  block('contact-body', 'contact-body', 'text', {
    heading: 'Send us a message',
    body: "Share a few details and we'll route your message to the right person.",
  }),
];

const FAQ = [
  block('faq-hero', 'faq-hero', 'hero', {
    heading: 'Frequently Asked Questions',
    body: 'Everything you need to know about MOQs, branding, samples, payments and delivery. Still stuck? Our gifting team is happy to help.',
    eyebrow: 'Help centre',
  }),
  block('faq-body', 'faq-body', 'text', {
    heading: 'Still have a question?',
    body: 'Pick the fastest way to reach us.',
  }),
];

const WALL = [
  block('wall-hero', 'wall-hero', 'hero', {
    heading: "Gifting stories we'd love to hear",
    body: 'Stories from teams who trusted RootEco with their gifting moments — from onboarding kits to festival hampers.',
    eyebrow: 'Wall of Love',
  }),
  block('wall-grid', 'wall-grid', 'quote', {
    heading: 'Demo content notice',
    body: "The eight reviews below are fictional placeholders created for layout preview. We don't display invented customer names, company logos or ratings as real endorsements.",
  }),
  block('wall-invite', 'wall-invite', 'cta', {
    heading: 'Planning your own gifting moment?',
    body: 'See how it feels to work with RootEco — start with a curated quote or build a hamper exactly the way you want it.',
    data: { label: 'Start a Quote', href: '/get-a-quote' },
  }),
];

const BLOG = [
  block('blog-hero', 'blog-hero', 'hero', {
    heading: 'Gifting notes & guides',
    body: 'Practical guides on corporate gifting, branding techniques, bulk planning and making your team feel valued.',
    eyebrow: 'Journal',
  }),
  block('blog-grid', 'blog-grid', 'collection', {
    heading: 'Journal articles',
    body: 'Published articles from the RootEco journal.',
    data: { locked: true },
  }),
];

const COLLECTIONS = [
  block('collections-hero', 'collections-hero', 'hero', {
    heading: 'Curated gifting collections',
    body: 'Thoughtfully assembled edits for festivals, onboarding, celebrations and everyday appreciation.',
    eyebrow: 'Collections',
  }),
  block('collection-grid', 'collection-grid', 'collection', {
    heading: 'Gifting collections',
    body: 'Published collections from the RootEco catalogue.',
    data: { locked: true },
  }),
];

const ROUTE_PAGES = {
  products: [
    block('products-hero', 'page-hero', 'hero', {
      heading: 'Every RootEco gift, in one place',
      body: 'Browse all products, filter by category, price or occasion, and save your favourites. Every item supports custom branding and bulk pricing.',
      eyebrow: 'The Full Catalogue',
    }),
    routeBlock('products-body', 'route-body', 'text', 'Product catalogue', 'Product grid, filters and sorting are rendered by the storefront catalogue.'),
  ],
  categories: [
    block('categories-hero', 'page-hero', 'hero', {
      heading: 'Find the perfect gift for every moment',
      body: 'Ten curated categories — from first-day welcome kits to festival hampers and executive gift sets. Every product can be branded, personalized and delivered pan India.',
      eyebrow: 'The RootEco Catalogue',
    }),
    routeBlock('categories-body', 'route-body', 'text', 'Category directory', 'Category cards are rendered from the published catalogue.'),
  ],
  search: [
    block('search-hero', 'page-hero', 'hero', {
      heading: 'Find the right gift, faster',
      body: 'Search across all RootEco categories and occasions. Looking for something custom? Our gifting team can source it.',
      eyebrow: 'Search',
    }),
    routeBlock('search-body', 'route-body', 'text', 'Search results', 'Search results are rendered live from the catalogue.'),
  ],
  'get-a-quote': [
    block('quote-hero', 'page-hero', 'hero', {
      heading: 'Get a Quote',
      body: "Tell us what you're planning and we'll curate gifting options with tiered pricing, branding mock-ups and a clear production timeline.",
      eyebrow: 'Bulk & corporate enquiries',
    }),
    routeBlock('quote-body', 'route-body', 'text', 'Quote request form', 'The quote form and its catalogue options are rendered by the storefront.'),
  ],
  'build-your-own-hamper': [
    block('hamper-hero', 'page-hero', 'hero', {
      heading: 'Build Your Own Hamper',
      body: 'Choose a box, fill it with gifts, add your branding and a gift note. We curate, pack and deliver — with a mock-up approval before production.',
      eyebrow: 'Make it yours',
    }),
    routeBlock('hamper-body', 'route-body', 'text', 'Hamper builder', 'Box and gift selection is rendered by the storefront builder.'),
  ],
  cart: [
    block('cart-hero', 'page-hero', 'hero', {
      heading: 'Your Gift Cart',
      body: 'Review your gifts, adjust quantities and proceed to checkout. Bulk quantities? Request a quote for tiered pricing.',
      eyebrow: 'Your selections',
    }),
    routeBlock('cart-body', 'route-body', 'text', 'Cart contents', 'Cart lines and totals are rendered from the shopper cart.'),
  ],
  checkout: [
    block('checkout-hero', 'page-hero', 'hero', {
      heading: 'Checkout',
      body: "Add your details and choose how you'd like to settle your order. We'll confirm stock and share the invoice or delivery slot by email.",
      eyebrow: 'Almost there',
    }),
    routeBlock('checkout-body', 'route-body', 'text', 'Checkout form', 'Address, delivery and payment steps are rendered by the checkout flow.'),
  ],
  'order-confirmation': [
    block('confirmation-hero', 'page-hero', 'hero', {
      heading: 'Order confirmed',
      body: 'Your gifting order has been placed. Keep the reference for tracking.',
      eyebrow: 'Thank you',
      data: { locked: true, managedIn: 'checkout' },
    }),
    routeBlock('confirmation-body', 'route-body', 'text', 'Order summary', 'Order details are rendered from the placed order in this browser.'),
  ],
  'track-order': [
    block('track-hero', 'page-hero', 'hero', {
      heading: 'Track your order',
      body: 'Enter your order reference and the email used at checkout to see the latest status from our workshop.',
      eyebrow: 'Order tracking',
    }),
    routeBlock('track-body', 'route-body', 'text', 'Tracking form', 'Order lookup and status timeline are rendered by the tracking flow.'),
  ],
  'product-detail': [
    block('product-detail-hero', 'dynamic-hero', 'hero', {
      heading: 'Product detail',
      body: 'Product name, imagery and price are supplied by the catalogue.',
      data: { locked: true },
    }),
    routeBlock('product-detail-body', 'route-body', 'text', 'Product details', 'Gallery, options and add-to-cart controls are rendered by the product route.'),
  ],
  category: [
    block('category-hero', 'dynamic-hero', 'hero', {
      heading: 'Category listing',
      body: 'Category name and description are supplied by the catalogue.',
      data: { locked: true },
    }),
    routeBlock('category-body', 'route-body', 'text', 'Category products', 'Filtered products are rendered by the category route.'),
  ],
  subcategory: [
    block('subcategory-hero', 'dynamic-hero', 'hero', {
      heading: 'Subcategory listing',
      body: 'Subcategory name and description are supplied by the catalogue.',
      data: { locked: true },
    }),
    routeBlock('subcategory-body', 'route-body', 'text', 'Subcategory products', 'Filtered products are rendered by the subcategory route.'),
  ],
  collection: [
    block('collection-hero', 'dynamic-hero', 'hero', {
      heading: 'Collection detail',
      body: 'Collection name and description are supplied by the catalogue.',
      data: { locked: true },
    }),
    routeBlock('collection-body', 'route-body', 'text', 'Collection products', 'Collection products are rendered by the collection route.'),
  ],
  'blog-post': [
    block('blog-post-hero', 'dynamic-hero', 'hero', {
      heading: 'Journal article',
      body: 'Article title, image and excerpt are supplied by the journal.',
      data: { locked: true },
    }),
    routeBlock('blog-post-body', 'route-body', 'text', 'Article body', 'Article content is rendered from the published journal entry.'),
  ],
  'privacy-policy': [
    block('privacy-hero', 'legal-hero', 'hero', {
      heading: 'Privacy Policy',
      body: 'What the demo collects, where it lives, and how you stay in control.',
      eyebrow: 'Legal',
    }),
    routeBlock('privacy-body', 'route-body', 'text', 'Policy document', 'Policy sections are rendered from the legal document content.'),
  ],
  'terms-and-conditions': [
    block('terms-hero', 'legal-hero', 'hero', {
      heading: 'Terms & Conditions',
      body: 'The ground rules for using this demo storefront and requesting a gifting programme.',
      eyebrow: 'Legal',
    }),
    routeBlock('terms-body', 'route-body', 'text', 'Policy document', 'Policy sections are rendered from the legal document content.'),
  ],
  'shipping-and-refund-policy': [
    block('shipping-hero', 'legal-hero', 'hero', {
      heading: 'Return, Refund & Shipping Policy',
      body: 'How gifting programmes are packed, dispatched, tracked and made right.',
      eyebrow: 'Legal',
    }),
    routeBlock('shipping-body', 'route-body', 'text', 'Policy document', 'Policy sections are rendered from the legal document content.'),
  ],
};

export const PAGE_LAYOUTS = {
  home: HOME,
  about: ABOUT,
  contact: CONTACT,
  faq: FAQ,
  'wall-of-love': WALL,
  blog: BLOG,
  collections: COLLECTIONS,
  ...ROUTE_PAGES,
};

export function layoutDefaults(slug) {
  return (PAGE_LAYOUTS[slug] || []).map((section, index) => ({
    ...section,
    id: null,
    order: index,
    data: { ...section.data },
  }));
}

export function sectionLayout(section) {
  return section?.data?.layout || null;
}

const HERO_LAYOUTS = new Set(['page-hero', 'legal-hero', 'dynamic-hero']);

export function heroFromSections(sections, fallback = {}) {
  const list = (Array.isArray(sections) ? sections : []).filter(
    (section) => section.data?.visible !== false && section.data?.enabled !== false,
  );
  const hero = list.find((section) => HERO_LAYOUTS.has(sectionLayout(section)));
  if (!hero) return fallback;
  return {
    eyebrow: hero.data?.subheading || fallback.eyebrow || '',
    title: hero.heading || fallback.title || '',
    subtitle: hero.body || fallback.subtitle || '',
    image: hero.image || fallback.image || '',
  };
}

export function sectionLayoutKey(section) {
  return section?.data?.layoutKey || null;
}

export function layoutLabel(section) {
  const layout = sectionLayout(section);
  return (layout && LAYOUT_LABELS[layout]) || null;
}

export function isLockedSection(section) {
  return Boolean(section?.data?.locked);
}

export function managedInLabel(section) {
  const { managedIn } = section?.data || {};
  if (managedIn === 'banners') return 'Banners module';
  return null;
}
