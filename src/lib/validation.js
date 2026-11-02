import { z } from 'zod';

const emptyToNull = (value) =>
  value === '' || value === undefined || value === null ? null : value;

export const text = (max = 5000) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable()).optional();

export const optionalId = () => z.preprocess(emptyToNull, z.string().min(1).nullable()).optional();

export const optionalNumber = (min = 0, max = 100000000) =>
  z
    .preprocess((value) => (value === '' || value === undefined || value === null ? null : value),
      z.coerce.number().min(min).max(max).nullable())
    .optional();

export const optionalDate = () =>
  z
    .preprocess((value) => (value === '' || value === undefined || value === null ? null : value),
      z.coerce.date().nullable())
    .optional();

export const optionalBoolean = () => z.boolean().optional();

export const stringList = (max = 40) => z.array(z.string().trim().min(1)).max(max).optional();

export const statusEnum = z.enum(['published', 'draft']).optional();

const seoFields = {
  seoTitle: text(200),
  seoDescription: text(400),
};

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: text(200),
  sku: text(80),
  shortDescription: text(400),
  description: text(10000),
  categoryId: z.string().min(1),
  subcategoryId: optionalId(),
  price: z.coerce.number().min(0).max(10000000),
  salePrice: optionalNumber(0, 10000000),
  stock: z.coerce.number().int().min(0).max(1000000).optional(),
  stockStatus: z.enum(['in', 'low', 'out']).optional(),
  colors: stringList(30),
  variants: stringList(30),
  images: stringList(20),
  specifications: z.unknown().nullable().optional(),
  customization: stringList(30),
  occasions: stringList(30),
  type: text(80),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviewsCount: z.coerce.number().int().min(0).max(1000000).optional(),
  badge: text(80),
  bestSeller: optionalBoolean(),
  featured: optionalBoolean(),
  newArrival: optionalBoolean(),
  status: statusEnum,
  ...seoFields,
  collectionIds: stringList(30),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: text(160),
  tagline: text(200),
  description: text(4000),
  image: text(1000),
  parentId: optionalId(),
  homeCard: optionalBoolean(),
  order: z.coerce.number().int().min(0).max(10000).optional(),
  status: statusEnum,
  ...seoFields,
});

export const collectionSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: text(160),
  description: text(4000),
  image: text(1000),
  order: z.coerce.number().int().min(0).max(10000).optional(),
  status: statusEnum,
  ...seoFields,
  productIds: stringList(100),
});

export const bannerSchema = z.object({
  kicker: text(120),
  title: z.string().trim().min(2).max(300),
  subtitle: text(1000),
  desktopImage: z.string().trim().min(1).max(1000),
  mobileImage: text(1000),
  primaryLabel: z.string().trim().min(1).max(80),
  primaryUrl: z.string().trim().min(1).max(500),
  secondaryLabel: text(80),
  secondaryUrl: text(500),
  accent: z.enum(['gold', 'green', 'cream']).optional(),
  order: z.coerce.number().int().min(0).max(10000).optional(),
  startDate: optionalDate(),
  endDate: optionalDate(),
  active: optionalBoolean(),
});

export const mediaUpdateSchema = z.object({
  alt: text(300),
  filename: text(300),
});

export const blogSchema = z.object({
  title: z.string().trim().min(2).max(300),
  slug: text(200),
  excerpt: text(600),
  content: z.string().trim().min(1).max(100000),
  image: text(1000),
  author: z.string().trim().min(1).max(120).optional(),
  category: text(120),
  tags: stringList(30),
  publishedAt: optionalDate(),
  status: statusEnum,
  ...seoFields,
});

export const testimonialSchema = z.object({
  client: z.string().trim().min(1).max(120),
  company: text(160),
  designation: text(120),
  review: z.string().trim().min(1).max(4000),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  image: text(1000),
  status: statusEnum,
  order: z.coerce.number().int().min(0).max(10000).optional(),
});

export const faqSchema = z.object({
  question: z.string().trim().min(2).max(500),
  answer: z.string().trim().min(1).max(8000),
  category: text(120),
  order: z.coerce.number().int().min(0).max(10000).optional(),
  status: statusEnum,
});

const pageSectionSchema = z.object({
  id: z.string().optional(),
  type: z.string().trim().min(1).max(60).default('text'),
  heading: z.preprocess(emptyToNull, z.string().trim().max(300).nullable()).optional(),
  body: z.preprocess(emptyToNull, z.string().max(20000).nullable()).optional(),
  image: z.preprocess(emptyToNull, z.string().max(1000).nullable()).optional(),
  data: z.unknown().nullable().optional(),
});

export const pageSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: text(200),
  content: text(50000),
  status: statusEnum,
  ...seoFields,
  sections: z.array(pageSectionSchema).max(40).optional(),
});

export const orderCreateSchema = z.object({
  customerName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30),
  company: text(160),
  gstin: text(30),
  addressLine1: z.string().trim().min(3).max(300),
  addressLine2: text(300),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(120),
  pincode: z.string().trim().min(3).max(20),
  country: z.string().trim().max(80).optional(),
  notes: text(2000),
  couponCode: text(40),
  paymentMethod: z.enum(['bank-transfer', 'cod', 'online']).optional(),
  items: z
    .array(
      z.object({
        custom: z.boolean().optional(),
        slug: text(200),
        boxId: text(40),
        brandingId: text(40),
        productSlugs: stringList(20),
        qty: z.coerce.number().int().min(1).max(10000),
        color: text(80),
        variant: text(120),
        note: text(500),
      })
    )
    .min(1)
    .max(100),
});

export const orderUpdateSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'])
    .optional(),
  paymentStatus: z.enum(['pending', 'authorized', 'paid', 'failed', 'refunded']).optional(),
  paymentRef: text(200),
  notes: text(2000),
});

export const quoteCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  company: text(200),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30),
  productId: optionalId(),
  productName: text(200),
  quantity: optionalNumber(1, 1000000),
  budget: text(120),
  branding: text(2000),
  message: text(4000),
});

export const quoteUpdateSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  company: text(200),
  email: z.string().trim().email().max(200).optional(),
  phone: z.string().trim().min(6).max(30).optional(),
  productId: optionalId(),
  productName: text(200),
  quantity: optionalNumber(1, 1000000),
  budget: text(120),
  branding: text(2000),
  message: text(4000),
  status: z.enum(['new', 'contacted', 'quoted', 'won', 'lost']).optional(),
  amount: optionalNumber(0, 100000000),
  internalNotes: text(4000),
  followUpDate: optionalDate(),
});

export const leadCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  company: text(200),
  email: z.preprocess(emptyToNull, z.string().trim().email().max(200).nullable()).optional(),
  phone: z.string().trim().min(6).max(30),
  city: text(120),
  source: z.string().trim().max(80).optional(),
  productInterest: text(200),
  requirement: text(4000),
  budget: text(120),
});

export const leadUpdateSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  company: text(200),
  email: z.preprocess(emptyToNull, z.string().trim().email().max(200).nullable()).optional(),
  phone: z.string().trim().min(6).max(30).optional(),
  city: text(120),
  source: z.string().trim().max(80).optional(),
  productInterest: text(200),
  requirement: text(4000),
  budget: text(120),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
  notes: text(4000),
  followUpDate: optionalDate(),
});

export const followUpSchema = z.object({
  dueDate: z.coerce.date(),
  note: text(1000),
  status: z.enum(['pending', 'done', 'cancelled']).optional(),
});

export const clientUpdateSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  company: text(200),
  email: z.preprocess(emptyToNull, z.string().trim().email().max(200).nullable()).optional(),
  phone: z.string().trim().min(6).max(30).optional(),
  city: text(120),
  notes: text(4000),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(160),
  company: text(200),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30),
  city: text(120),
  productInterest: text(200),
  requirement: z.string().trim().min(5).max(4000),
  budget: text(120),
  source: z.string().trim().max(80).optional(),
});

export const eventSchema = z.object({
  type: z.enum([
    'page_view',
    'product_view',
    'add_to_cart',
    'checkout_started',
    'purchase',
    'quote_request',
    'whatsapp_click',
    'contact_submit',
  ]),
  path: text(500),
  productId: optionalId(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const couponSchema = z.object({
  code: z.string().trim().min(2).max(40),
  type: z.enum(['percent', 'fixed']).optional(),
  value: z.coerce.number().min(0).max(1000000),
  minSubtotal: optionalNumber(0, 100000000),
  active: optionalBoolean(),
  expiresAt: optionalDate(),
});

export const whatsappSendSchema = z.object({
  to: z.string().trim().min(6).max(30),
  body: z.string().trim().min(1).max(4000),
  clientId: optionalId(),
});

export const trackOrderSchema = z.object({
  number: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
});

export const settingsSchema = z.object({
  general: z
    .object({
      siteName: z.string().trim().min(1).max(120),
      tagline: z.string().trim().max(300),
      logoUrl: z.string().trim().max(1000),
      faviconUrl: z.string().trim().max(1000),
      announcement: z.string().trim().max(300),
      announcementActive: z.boolean(),
    })
    .optional(),
  contact: z
    .object({
      email: z.string().trim().email().max(200),
      phone: z.string().trim().max(40),
      whatsapp: z.string().trim().max(40),
      address: z.string().trim().max(500),
      hours: z.string().trim().max(200),
    })
    .optional(),
  social: z
    .object({
      instagram: z.string().trim().max(500),
      linkedin: z.string().trim().max(500),
      facebook: z.string().trim().max(500),
      twitter: z.string().trim().max(500),
      youtube: z.string().trim().max(500),
    })
    .optional(),
  footer: z
    .object({
      description: z.string().trim().max(600),
      copyright: z.string().trim().max(300),
    })
    .optional(),
  seo: z
    .object({
      defaultTitle: z.string().trim().max(200),
      titleTemplate: z.string().trim().max(200),
      defaultDescription: z.string().trim().max(500),
      keywords: z.string().trim().max(500),
      ogImage: z.string().trim().max(1000),
      canonicalBase: z.string().trim().max(300),
      robots: z.string().trim().max(100),
      sitemapEnabled: z.boolean(),
    })
    .optional(),
  marketing: z
    .object({
      ga4Id: z.string().trim().max(60),
      metaPixelId: z.string().trim().max(60),
      googleSiteVerification: z.string().trim().max(200),
    })
    .optional(),
  payments: z
    .object({
      methods: z.array(z.string()).max(10),
      onlineEnabled: z.boolean(),
      instructions: z.string().trim().max(2000),
    })
    .optional(),
  whatsapp: z
    .object({
      number: z.string().trim().max(30),
      message: z.string().trim().max(1000),
      enabled: z.boolean(),
    })
    .optional(),
});
