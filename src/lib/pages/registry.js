export const PAGE_GROUPS = [
  'Storefront',
  'Catalogue',
  'Conversion',
  'Commerce',
  'Legal',
  'Templates',
];

export const TEMPLATE_OPTIONS = [
  { value: 'landing', label: 'Landing', description: 'A hero banner plus your own sections.' },
  { value: 'campaign', label: 'Campaign', description: 'Collection spotlight, process steps and a call to action.' },
  { value: 'editorial', label: 'Editorial', description: 'A text-led introduction for stories and guides.' },
  { value: 'blank', label: 'Blank', description: 'Start empty and add sections one at a time.' },
];

export const TEMPLATE_LABELS = Object.fromEntries(TEMPLATE_OPTIONS.map((option) => [option.value, option.label]));

export const TEMPLATE_STARTERS = {
  landing: [
    {
      type: 'hero',
      heading: 'Corporate gifting, handled end to end',
      body: 'Curated products, careful branding and reliable bulk delivery across India.',
      data: { ctaLabel: 'Get a quote', ctaHref: '/get-a-quote', align: 'left', background: 'cream' },
    },
  ],
  campaign: [
    {
      type: 'collection',
      heading: 'Festive gifting collections',
      body: 'Preview the hampers and welcome kits teams reorder year after year.',
      data: {},
    },
    {
      type: 'process',
      heading: 'From brief to doorstep',
      body: 'Share the brief, approve a sample, and we handle production, quality checks and dispatch.',
      data: { steps: [] },
    },
    {
      type: 'cta',
      heading: 'Planning a bulk order?',
      body: 'Tell us the quantity and occasion and we will return tiered pricing with a branding mock-up.',
      data: { ctaLabel: 'Talk to our team', ctaHref: '/contact' },
    },
  ],
  editorial: [
    {
      type: 'text',
      heading: 'A considered gifting programme',
      body: 'Use this space to explain the thinking behind the gifts, the branding and the delivery plan.',
      data: {},
    },
  ],
  blank: [],
};

export function starterSections(template) {
  const sections = TEMPLATE_STARTERS[template] || [];
  return sections.map((section) => ({ ...section, data: { ...(section.data || {}) } }));
}

export const SECTION_TEMPLATE_TYPES = {
  landing: ['hero'],
  campaign: ['collection', 'process', 'cta'],
  editorial: ['text', 'image', 'story', 'columns', 'quote'],
};

export function deriveTemplate(sections) {
  const types = new Set((Array.isArray(sections) ? sections : []).map((section) => section.type));
  if (!types.size) return 'blank';
  if (types.has('hero')) return 'landing';
  if (['collection', 'process', 'cta'].some((type) => types.has(type))) return 'campaign';
  return 'editorial';
}

export const PUBLIC_PAGES = [
  {
    slug: 'home',
    path: '/',
    title: 'Home',
    group: 'Storefront',
    kind: 'content',
    defaultTemplate: 'landing',
    description: 'Homepage assembled from hero, catalogue and editorial sections.',
  },
  {
    slug: 'about',
    path: '/about',
    title: 'About Us',
    group: 'Storefront',
    kind: 'content',
    defaultTemplate: 'editorial',
    description: 'Company story, process and the people behind RootEco gifting.',
  },
  {
    slug: 'contact',
    path: '/contact',
    title: 'Contact Us',
    group: 'Storefront',
    kind: 'content',
    defaultTemplate: 'editorial',
    description: 'Contact details and enquiry form for corporate gifting.',
  },
  {
    slug: 'faq',
    path: '/faq',
    title: 'FAQ',
    group: 'Storefront',
    kind: 'content',
    defaultTemplate: 'editorial',
    description: 'Answers on MOQs, branding, samples, payment terms and delivery.',
    seoTitle: 'FAQ',
    seoDescription:
      'Answers to common questions about RootEco corporate gifting — MOQs, branding, samples, payment terms, delivery and tracking.',
  },
  {
    slug: 'blog',
    path: '/blog',
    title: 'Journal',
    group: 'Storefront',
    kind: 'content',
    defaultTemplate: 'editorial',
    description: 'Guides and notes on corporate gifting and bulk planning.',
    seoTitle: 'Journal',
    seoDescription:
      'Guides and notes on corporate gifting, branding and bulk planning from RootEco.',
  },
  {
    slug: 'collections',
    path: '/collections',
    title: 'Collections',
    group: 'Storefront',
    kind: 'content',
    defaultTemplate: 'landing',
    description: 'Curated gifting collections for festivals, onboarding and celebrations.',
    seoTitle: 'Collections',
    seoDescription:
      'Curated corporate gifting collections for festivals, onboarding and celebrations by RootEco.',
  },
  {
    slug: 'wall-of-love',
    path: '/wall-of-love',
    title: 'Wall of Love',
    group: 'Storefront',
    kind: 'content',
    defaultTemplate: 'editorial',
    description: 'Customer stories and testimonials from gifting teams.',
    seoTitle: 'Wall of Love',
    seoDescription:
      'Customer stories from teams who trusted RootEco with their corporate gifting, festival hampers and onboarding kits.',
  },
  {
    slug: 'products',
    path: '/products',
    title: 'All Corporate Gifts',
    group: 'Catalogue',
    kind: 'catalogue',
    defaultTemplate: 'blank',
    description: 'Full product catalogue with category filters and sorting.',
    seoTitle: 'All Corporate Gifts',
    seoDescription:
      'Browse the full RootEco catalogue of corporate gifts — welcome kits, premium gift sets, drinkware, tech, bags, apparel and festival hampers.',
  },
  {
    slug: 'categories',
    path: '/categories',
    title: 'Shop by Category',
    group: 'Catalogue',
    kind: 'catalogue',
    defaultTemplate: 'blank',
    description: 'Category index with product counts and home cards.',
    seoTitle: 'Shop by Category',
    seoDescription:
      'Browse RootEco corporate gifting categories — welcome kits, drinkware, tech, bags, eco-friendly gifts, festival hampers and premium gift sets.',
  },
  {
    slug: 'search',
    path: '/search',
    title: 'Search Gifts',
    group: 'Catalogue',
    kind: 'catalogue',
    defaultTemplate: 'blank',
    description: 'On-site search across products and categories.',
    seoTitle: 'Search Gifts',
    seoDescription:
      'Search RootEco corporate gifts by product, category or occasion — welcome kits, hampers, drinkware, tech and branded merchandise.',
  },
  {
    slug: 'get-a-quote',
    path: '/get-a-quote',
    title: 'Get a Quote',
    group: 'Conversion',
    kind: 'conversion',
    defaultTemplate: 'blank',
    description: 'Bulk enquiry form with tiered pricing and mock-up requests.',
    seoTitle: 'Get a Quote',
    seoDescription:
      'Request a corporate gifting quote from RootEco — tiered pricing, branding mock-ups and a clear production timeline.',
  },
  {
    slug: 'build-your-own-hamper',
    path: '/build-your-own-hamper',
    title: 'Build Your Own Hamper',
    group: 'Conversion',
    kind: 'conversion',
    defaultTemplate: 'blank',
    description: 'Box builder that pairs products, branding and a gift note.',
    seoTitle: 'Build Your Own Hamper',
    seoDescription:
      'Pick a box, choose your gifts, add branding and build a custom corporate hamper with RootEco.',
  },
  {
    slug: 'cart',
    path: '/cart',
    title: 'Gift Cart',
    group: 'Commerce',
    kind: 'commerce',
    defaultTemplate: 'blank',
    description: 'Cart review with quantities and recommendations.',
    seoTitle: 'Gift Cart',
    seoDescription: 'Review your RootEco gift selections, update quantities and proceed to checkout.',
  },
  {
    slug: 'checkout',
    path: '/checkout',
    title: 'Checkout',
    group: 'Commerce',
    kind: 'commerce',
    defaultTemplate: 'blank',
    description: 'Company and delivery details for the order.',
    seoTitle: 'Checkout',
    seoDescription:
      'Complete your RootEco corporate gifting order with bank transfer or cash on delivery.',
  },
  {
    slug: 'order-confirmation',
    path: '/order-confirmation',
    title: 'Order Confirmation',
    group: 'Commerce',
    kind: 'commerce',
    defaultTemplate: 'blank',
    description: 'Confirmation screen with the next steps for the order.',
    seoTitle: 'Order Confirmation',
    seoDescription: 'Your RootEco order confirmation and next steps.',
  },
  {
    slug: 'track-order',
    path: '/track-order',
    title: 'Track Order',
    group: 'Commerce',
    kind: 'commerce',
    defaultTemplate: 'blank',
    description: 'Order lookup by reference number and email.',
    seoTitle: 'Track Order',
    seoDescription:
      'Check the status of your RootEco order with your order reference and email address.',
  },
  {
    slug: 'privacy-policy',
    path: '/privacy-policy',
    title: 'Privacy Policy',
    group: 'Legal',
    kind: 'legal',
    defaultTemplate: 'blank',
    description: 'How enquiry, cart and wishlist data is handled.',
    seoTitle: 'Privacy Policy',
    seoDescription:
      'How the RootEco demo storefront handles enquiry details, cart and wishlist data stored in your browser, and your privacy choices.',
  },
  {
    slug: 'terms-and-conditions',
    path: '/terms-and-conditions',
    title: 'Terms & Conditions',
    group: 'Legal',
    kind: 'legal',
    defaultTemplate: 'blank',
    description: 'Terms covering site use, quotations, customisation and delivery.',
    seoTitle: 'Terms & Conditions',
    seoDescription:
      'Terms of use for the RootEco demo corporate gifting storefront, covering site use, quotations, customization, delivery and liability.',
  },
  {
    slug: 'shipping-and-refund-policy',
    path: '/shipping-and-refund-policy',
    title: 'Return, Refund & Shipping Policy',
    group: 'Legal',
    kind: 'legal',
    defaultTemplate: 'blank',
    description: 'Coverage, lead times, damage reporting and cancellations.',
    seoTitle: 'Return, Refund & Shipping Policy',
    seoDescription:
      'Demo shipping coverage, lead times, multi-address delivery, damage reporting, returns, refunds and cancellations for RootEco corporate gifting.',
  },
  {
    slug: 'product-detail',
    path: '/products/{productSlug}',
    redirectTo: '/products',
    title: 'Product detail template',
    group: 'Templates',
    kind: 'template',
    defaultTemplate: 'blank',
    description: 'Sections appended below every product detail page.',
  },
  {
    slug: 'category',
    path: '/categories/{categorySlug}',
    redirectTo: '/categories',
    title: 'Category template',
    group: 'Templates',
    kind: 'template',
    defaultTemplate: 'blank',
    description: 'Sections appended below every category listing.',
  },
  {
    slug: 'subcategory',
    path: '/categories/{categorySlug}/{subcategorySlug}',
    redirectTo: '/categories',
    title: 'Subcategory template',
    group: 'Templates',
    kind: 'template',
    defaultTemplate: 'blank',
    description: 'Sections appended below every subcategory listing.',
  },
  {
    slug: 'collection',
    path: '/collections/{slug}',
    redirectTo: '/collections',
    title: 'Collection template',
    group: 'Templates',
    kind: 'template',
    defaultTemplate: 'blank',
    description: 'Sections appended below every collection detail page.',
  },
  {
    slug: 'blog-post',
    path: '/blog/{slug}',
    redirectTo: '/blog',
    title: 'Blog post template',
    group: 'Templates',
    kind: 'template',
    defaultTemplate: 'blank',
    description: 'Sections appended below every journal article.',
  },
];

export const REGISTRY_BY_SLUG = new Map(PUBLIC_PAGES.map((entry) => [entry.slug, entry]));

export const REGISTRY_SLUGS = new Set(PUBLIC_PAGES.map((entry) => entry.slug));

export const BUILT_IN_PATH_BY_SLUG = Object.fromEntries(
  PUBLIC_PAGES.map((entry) => [entry.slug, entry.redirectTo || entry.path])
);

export const PUBLIC_PATH_SET = new Set(
  PUBLIC_PAGES.filter((entry) => entry.kind !== 'template').map((entry) => entry.path)
);

export function pagePathFor(slug) {
  const entry = REGISTRY_BY_SLUG.get(slug);
  if (entry) return entry.redirectTo || entry.path;
  return `/pages/${slug}`;
}

export function registryEntry(slug) {
  return REGISTRY_BY_SLUG.get(slug) || null;
}
