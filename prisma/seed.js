import { PrismaClient } from '@prisma/client';
import products from '../src/data/products.js';
import categories from '../src/data/categories.js';
import { festivalCollections } from '../src/data/collections.js';
import heroBanners from '../src/data/banners.js';
import testimonials from '../src/data/testimonials.js';
import faqs from '../src/data/faqs.js';
import { brand, WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from '../src/data/navigation.js';
import { hashPassword } from '../src/lib/password.js';

const prisma = new PrismaClient();

const now = new Date();
const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

function truncate(text, length = 160) {
  if (!text) return null;
  const clean = String(text).trim();
  return clean.length > length ? `${clean.slice(0, length - 1).trimEnd()}…` : clean;
}

async function seedOwner() {
  const email = process.env.OWNER_EMAIL;
  const password = process.env.OWNER_PASSWORD;
  const name = process.env.OWNER_NAME || 'RootEco Owner';

  if (!email || !password) {
    console.warn(
      'OWNER_EMAIL / OWNER_PASSWORD are not set — skipping owner seed. Set them to create the dashboard account.'
    );
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.owner.upsert({
    where: { email: email.toLowerCase() },
    update: { name, passwordHash },
    create: { email: email.toLowerCase(), name, passwordHash },
  });
  console.log(`Owner ready: ${email}`);
}

async function seedCategories() {
  const bySlug = new Map();

  for (const [index, category] of categories.entries()) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        tagline: category.tagline,
        description: category.description,
        image: category.image,
        homeCard: Boolean(category.homeCard),
        order: index,
        status: 'published',
      },
      create: {
        name: category.name,
        slug: category.slug,
        tagline: category.tagline,
        description: category.description,
        image: category.image,
        homeCard: Boolean(category.homeCard),
        order: index,
        status: 'published',
        seoTitle: `${category.name} | Corporate Gifting | RootEco`,
        seoDescription: truncate(category.description),
      },
    });
    bySlug.set(category.slug, record);

    for (const [subIndex, sub] of (category.subcategories || []).entries()) {
      const child = await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          parentId: record.id,
          order: subIndex,
          status: 'published',
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          parentId: record.id,
          order: subIndex,
          status: 'published',
          seoTitle: `${sub.name} | ${category.name} | RootEco`,
        },
      });
      bySlug.set(sub.slug, child);
    }
  }

  console.log(`Categories seeded: ${bySlug.size}`);
  return bySlug;
}

async function seedCollections() {
  for (const [index, collection] of festivalCollections.entries()) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: {
        name: collection.name,
        description: collection.tagline,
        image: collection.image,
        order: index,
        status: 'published',
      },
      create: {
        name: collection.name,
        slug: collection.slug,
        description: collection.tagline,
        image: collection.image,
        order: index,
        status: 'published',
        seoTitle: `${collection.name} | RootEco`,
      },
    });
  }
  console.log(`Collections seeded: ${festivalCollections.length}`);
}

async function seedProducts(categoryBySlug) {
  const productBySlug = new Map();

  for (const [index, product] of products.entries()) {
    const parent = categoryBySlug.get(product.category);
    const child = product.subcategory ? categoryBySlug.get(product.subcategory) : null;
    if (!parent) {
      console.warn(`Skipping product ${product.slug} — unknown category ${product.category}`);
      continue;
    }

    const stockQuantity = product.stock === 'out' ? 0 : product.stock === 'low' ? 5 : 25;
    const data = {
      name: product.name,
      sku: `RE-${String(index + 1).padStart(3, '0')}`,
      shortDescription: truncate(product.description, 160),
      description: product.description,
      categoryId: parent.id,
      subcategoryId: child?.id || null,
      price: product.mrp || product.price,
      salePrice: product.mrp ? product.price : null,
      stock: stockQuantity,
      stockStatus: product.stock || 'in',
      colors: product.colors || [],
      variants: product.variants || [],
      images: product.images || [],
      specifications: product.specifications || {},
      customization: product.customization || [],
      occasions: product.occasions || [],
      type: product.type || null,
      rating: product.rating || 4.8,
      reviewsCount: product.reviewsCount || 0,
      badge: product.badge || null,
      bestSeller: Boolean(product.bestSeller),
      featured: Boolean(product.featured),
      newArrival: Boolean(product.isNew),
      status: 'published',
      seoTitle: `${product.name} | RootEco Corporate Gifting`,
      seoDescription: truncate(product.description),
    };

    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: data,
      create: { slug: product.slug, ...data },
    });
    productBySlug.set(product.slug, record);
  }

  console.log(`Products seeded: ${productBySlug.size}`);
  return productBySlug;
}

async function seedBanners() {
  for (const [index, banner] of heroBanners.entries()) {
    const existing = await prisma.banner.findFirst({ where: { title: banner.title } });
    const data = {
      kicker: banner.kicker,
      subtitle: banner.subtitle,
      desktopImage: banner.image,
      primaryLabel: banner.primaryCta.label,
      primaryUrl: banner.primaryCta.link,
      secondaryLabel: banner.secondaryCta?.label || null,
      secondaryUrl: banner.secondaryCta?.link || null,
      accent: banner.accent || 'gold',
      order: index,
      active: true,
    };
    if (existing) {
      await prisma.banner.update({ where: { id: existing.id }, data });
    } else {
      await prisma.banner.create({ data: { title: banner.title, ...data } });
    }
  }
  console.log(`Banners seeded: ${heroBanners.length}`);
}

async function seedContent() {
  for (const [index, testimonial] of testimonials.entries()) {
    const existing = await prisma.testimonial.findFirst({
      where: { client: testimonial.client, company: testimonial.company },
    });
    const data = {
      client: testimonial.client,
      company: testimonial.company,
      designation: testimonial.role,
      review: testimonial.review,
      rating: testimonial.rating,
      status: 'published',
      order: index,
    };
    if (existing) {
      await prisma.testimonial.update({ where: { id: existing.id }, data });
    } else {
      await prisma.testimonial.create({ data });
    }
  }

  for (const [index, faq] of faqs.entries()) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    const data = {
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
      order: index,
      status: 'published',
    };
    if (existing) {
      await prisma.faq.update({ where: { id: existing.id }, data });
    } else {
      await prisma.faq.create({ data });
    }
  }

  const pages = [
    {
      slug: 'home',
      title: 'Home',
      content: 'The RootEco homepage — hero, curated collections, process and social proof.',
      seoTitle: 'RootEco — Premium Corporate Gifting',
      seoDescription:
        'Thoughtful corporate gifting, festival hampers, welcome kits and branded merchandise. Curated, customized and delivered pan India.',
      sections: [
        { type: 'hero', heading: 'Thoughtful Gifts. Meaningful Connections.', body: 'Curated corporate gifting for teams that care.' },
        { type: 'collection', heading: 'Corporate Gifting', body: 'Welcome kits, tech and essentials curated for your team.' },
      ],
    },
    {
      slug: 'about',
      title: 'About Us',
      content:
        'RootEco is a curated corporate gifting storefront built around thoughtful products, careful branding and reliable bulk delivery.',
      seoTitle: 'About Us | RootEco',
      seoDescription:
        'Learn how RootEco curates corporate gifts, manages branding and delivers bulk orders across India.',
      sections: [
        { type: 'story', heading: 'Gifting, handled thoughtfully', body: 'We curate products people keep, apply branding carefully and deliver pan India.' },
        { type: 'process', heading: 'An eight-step process', body: 'From PO and approval samples to production, QC and delivery — every stage is documented.' },
      ],
    },
    {
      slug: 'contact',
      title: 'Contact Us',
      content: 'Talk to the RootEco team about corporate gifting, bulk orders and custom hampers.',
      seoTitle: 'Contact Us | RootEco',
      seoDescription:
        'Contact RootEco for corporate gifting enquiries, bulk orders and custom branding.',
      sections: [],
    },
  ];

  for (const page of pages) {
    const { sections, ...data } = page;
    const record = await prisma.page.upsert({
      where: { slug: page.slug },
      update: data,
      create: { ...data, status: 'published' },
    });
    await prisma.pageSection.deleteMany({ where: { pageId: record.id } });
    if (sections.length) {
      await prisma.pageSection.createMany({
        data: sections.map((section, index) => ({
          pageId: record.id,
          type: section.type,
          heading: section.heading,
          body: section.body,
          order: index,
        })),
      });
    }
  }

  const blogs = [
    {
      title: 'Corporate gifting checklist: from brief to doorstep (Demo)',
      slug: 'corporate-gifting-checklist-demo',
      excerpt:
        'Sample article for previewing the RootEco blog module — a practical checklist for planning a bulk gifting programme.',
      content:
        'This is sample content for the blog module.\n\n1. Define the audience and quantity.\n2. Agree a budget per gift and a delivery window.\n3. Shortlist products with branding options.\n4. Approve a physical or digital mock-up.\n5. Confirm addresses and dispatch dates.\n\nReplace this article from the dashboard to publish real content.',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&q=80&auto=format&fit=crop',
      author: 'RootEco Team',
      category: 'Guides',
      tags: ['planning', 'bulk orders'],
      publishedAt: daysAgo(12),
      status: 'published',
      seoTitle: 'Corporate gifting checklist (Demo) | RootEco',
      seoDescription: 'A sample RootEco guide to planning a corporate gifting programme.',
    },
    {
      title: 'How branding brings a gift to life (Demo)',
      slug: 'how-branding-brings-a-gift-to-life-demo',
      excerpt:
        'Sample article about engraving, embroidery and print techniques — for previewing the blog module.',
      content:
        'This is sample content for the blog module.\n\nBranding turns a nice product into a gift that belongs to the recipient’s team. Laser engraving suits metal and wood, embroidery suits soft goods, and UV print handles full-colour artwork.\n\nShare vector artwork and we will return a mock-up before production.',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80&auto=format&fit=crop',
      author: 'RootEco Team',
      category: 'Branding',
      tags: ['branding', 'customization'],
      publishedAt: daysAgo(5),
      status: 'published',
      seoTitle: 'Branding techniques for corporate gifts (Demo) | RootEco',
      seoDescription: 'A sample RootEco article on engraving, embroidery and UV printing.',
    },
  ];

  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: blog,
      create: blog,
    });
  }

  console.log(`Content seeded: ${testimonials.length} testimonials, ${faqs.length} FAQs, ${pages.length} pages, ${blogs.length} demo posts`);
}

async function seedSettings() {
  const settings = {
    general: {
      siteName: brand.name,
      tagline: brand.tagline,
      logoUrl: '/images/rooteco-logo.png',
      faviconUrl: '/icon.png',
      announcement: 'Thoughtful Gifting. Made Effortless.',
      announcementActive: true,
    },
    contact: {
      email: brand.email,
      phone: brand.phone,
      whatsapp: brand.phone,
      address: brand.address,
      hours: brand.hours,
    },
    social: { instagram: '', linkedin: '', facebook: '', twitter: '', youtube: '' },
    footer: {
      description:
        'Curated corporate gifting, festival hampers and branded merchandise — delivered pan India.',
      copyright: `© ${now.getFullYear()} RootEco. All rights reserved.`,
    },
    seo: {
      defaultTitle: 'RootEco — Premium Corporate Gifting',
      titleTemplate: '%s | RootEco',
      defaultDescription:
        'Thoughtful corporate gifting, festival hampers, welcome kits and branded merchandise. Curated, customized and delivered pan India.',
      keywords: 'corporate gifting, festival hampers, welcome kits, branded merchandise, India',
      ogImage: '/images/rooteco-logo.png',
      canonicalBase: process.env.SITE_URL || 'http://localhost:3000',
      robots: 'index, follow',
      sitemapEnabled: true,
    },
    marketing: { ga4Id: '', metaPixelId: '', googleSiteVerification: '' },
    payments: {
      methods: ['bank-transfer', 'cod'],
      onlineEnabled: false,
      instructions:
        'A 50% or 100% advance is confirmed on the proforma invoice. Online payment will be enabled once the payment gateway is configured.',
    },
    whatsapp: {
      number: WHATSAPP_NUMBER,
      message: WHATSAPP_MESSAGE,
      enabled: true,
    },
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log(`Settings seeded: ${Object.keys(settings).length} groups`);
}

async function seedMedia() {
  await prisma.media.upsert({
    where: { url: '/images/rooteco-logo.png' },
    update: { alt: 'RootEco logo' },
    create: {
      filename: 'rooteco-logo.png',
      url: '/images/rooteco-logo.png',
      alt: 'RootEco logo',
      width: 1080,
      height: 1058,
      provider: 'local',
      mime: 'image/png',
    },
  });
}

async function seedDemoRecords(productBySlug) {
  const demoClient = await prisma.client.upsert({
    where: { phone: '+919000000001' },
    update: { name: 'Demo Corporate Client', company: 'Demo Corp' },
    create: {
      name: 'Demo Corporate Client',
      company: 'Demo Corp',
      email: 'demo.client@rooteco.example.com',
      phone: '+919000000001',
      city: 'Gurugram',
      notes: 'Seeded demo client — safe to edit or delete.',
    },
  });

  const demoLead = await prisma.lead.findFirst({
    where: { phone: '+919000000001', email: 'demo.client@rooteco.example.com' },
  });
  if (!demoLead) {
    await prisma.lead.create({
      data: {
        name: demoClient.name,
        company: demoClient.company,
        email: demoClient.email,
        phone: demoClient.phone,
        city: demoClient.city,
        source: 'demo-seed',
        productInterest: 'Welcome Kits',
        requirement: 'Seeded demo lead for dashboard preview.',
        budget: '₹1,500–₹2,500 per gift',
        status: 'qualified',
        notes: 'Seeded demo record — safe to delete.',
        clientId: demoClient.id,
        followUpDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        followUps: {
          create: {
            dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            note: 'Confirm quantity and delivery cities.',
            status: 'pending',
          },
        },
      },
    });
  }

  const quoteProduct = productBySlug.get('evergreen-onboarding-kit');
  const demoQuote = await prisma.quote.findFirst({
    where: { email: 'demo.client@rooteco.example.com', phone: '+919000000001' },
  });
  if (!demoQuote) {
    await prisma.quote.create({
      data: {
        name: demoClient.name,
        company: demoClient.company,
        email: demoClient.email,
        phone: demoClient.phone,
        productId: quoteProduct?.id || null,
        productName: quoteProduct?.name || 'Corporate gifting requirement',
        quantity: 150,
        budget: '₹2,000 per gift',
        branding: 'Engraved logo on bottle and notebook',
        message: 'Seeded demo quotation for dashboard preview.',
        status: 'new',
        clientId: demoClient.id,
      },
    });
  }

  const orderItems = [
    { slug: 'evergreen-onboarding-kit', qty: 2 },
    { slug: 'sustain-steel-bottle', qty: 3 },
  ]
    .map(({ slug, qty }) => {
      const product = productBySlug.get(slug);
      if (!product) return null;
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        image: product.images[0] || null,
        price: product.salePrice || product.price,
        qty,
      };
    })
    .filter(Boolean);

  if (orderItems.length) {
    const subtotal = orderItems.reduce((total, item) => total + Number(item.price) * item.qty, 0);
    const existingOrder = await prisma.order.findUnique({ where: { number: 'RE-DEMO-1001' } });
    if (!existingOrder) {
      await prisma.order.create({
        data: {
          number: 'RE-DEMO-1001',
          customerName: 'Demo Corporate Client',
          email: 'demo.client@rooteco.example.com',
          phone: '+919000000001',
          company: 'Demo Corp',
          addressLine1: 'Demo address',
          city: 'Gurugram',
          state: 'Haryana',
          pincode: '122001',
          notes: 'Seeded demo order — safe to delete.',
          subtotal,
          shipping: 0,
          total: subtotal,
          status: 'processing',
          paymentStatus: 'pending',
          createdAt: daysAgo(4),
          items: { create: orderItems },
        },
      });
    }
  }

  console.log('Demo CRM/order records seeded (labeled as demo).');
}

async function main() {
  console.log('Seeding RootEco database…');
  await seedOwner();
  const categoryBySlug = await seedCategories();
  await seedCollections();
  const productBySlug = await seedProducts(categoryBySlug);
  await seedBanners();
  await seedContent();
  await seedSettings();
  await seedMedia();
  await seedDemoRecords(productBySlug);
  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
