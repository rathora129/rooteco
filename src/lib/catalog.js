import prisma from '@/lib/prisma';

const decimalToNumber = (value) => (value == null ? null : Number(value));

function serializeJson(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value;
}

function stockLabel(stock, fallback) {
  if (fallback === 'out') return 'out';
  if (stock <= 0) return 'out';
  if (stock <= 10) return 'low';
  return 'in';
}

export function mapProduct(product) {
  const price = decimalToNumber(product.salePrice) ?? decimalToNumber(product.price) ?? 0;
  const mrp = decimalToNumber(product.price) ?? price;
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    description: product.description || product.shortDescription || '',
    shortDescription: product.shortDescription || '',
    category: product.category?.slug || '',
    categoryName: product.category?.name || '',
    subcategory: product.subcategory?.slug || null,
    subcategoryName: product.subcategory?.name || null,
    price,
    mrp,
    stock: stockLabel(product.stock, product.stockStatus),
    stockQty: product.stock,
    colors: product.colors || [],
    variants: product.variants || [],
    images: product.images?.length ? product.images : ['/images/rooteco-logo.png'],
    specifications: serializeJson(product.specifications),
    customization: product.customization || [],
    occasions: product.occasions || [],
    type: product.type || product.category?.name || 'Gift',
    rating: product.rating ?? 4.8,
    reviewsCount: product.reviewsCount ?? 0,
    badge: product.badge || null,
    featured: Boolean(product.featured),
    bestSeller: Boolean(product.bestSeller),
    isNew: Boolean(product.newArrival),
    seoTitle: product.seoTitle || null,
    seoDescription: product.seoDescription || null,
    status: product.status,
    collections: (product.collections || []).map((collection) => collection.slug),
    createdAt: product.createdAt,
  };
}

export function mapCategory(category, children = []) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    tagline: category.tagline || '',
    description: category.description || '',
    image: category.image || '',
    homeCard: Boolean(category.homeCard),
    order: category.order,
    status: category.status,
    seoTitle: category.seoTitle || null,
    seoDescription: category.seoDescription || null,
    parentId: category.parentId || null,
    productCount: category._count?.products ?? undefined,
    subcategories: children.map((child) => ({
      id: child.id,
      slug: child.slug,
      name: child.name,
      description: child.description || '',
      image: child.image || '',
    })),
  };
}

export function mapCollection(collection) {
  return {
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    tagline: collection.description || '',
    description: collection.description || '',
    image: collection.image || '',
    link: `/collections/${collection.slug}`,
    status: collection.status,
    order: collection.order,
    seoTitle: collection.seoTitle || null,
    seoDescription: collection.seoDescription || null,
    productCount: collection._count?.products ?? undefined,
  };
}

export function mapBanner(banner) {
  return {
    id: banner.id,
    kicker: banner.kicker || '',
    title: banner.title,
    subtitle: banner.subtitle || '',
    image: banner.desktopImage,
    mobileImage: banner.mobileImage || banner.desktopImage,
    primaryCta: { label: banner.primaryLabel, link: banner.primaryUrl },
    secondaryCta: banner.secondaryLabel
      ? { label: banner.secondaryLabel, link: banner.secondaryUrl || '#' }
      : null,
    accent: banner.accent || 'gold',
  };
}

export function mapTestimonial(testimonial) {
  return {
    id: testimonial.id,
    client: testimonial.client,
    company: testimonial.company || '',
    role: testimonial.designation || '',
    designation: testimonial.designation || '',
    review: testimonial.review,
    rating: testimonial.rating,
    image: testimonial.image || null,
  };
}

export function mapFaq(faq) {
  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    category: faq.category || 'General',
    order: faq.order,
  };
}

const productInclude = {
  category: { select: { slug: true, name: true } },
  subcategory: { select: { slug: true, name: true } },
  collections: { select: { slug: true } },
};

const PRODUCT_SORTS = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  'best-selling': (a, b) =>
    Number(b.bestSeller) - Number(a.bestSeller) || b.reviewsCount - a.reviewsCount,
  rating: (a, b) => b.rating - a.rating,
  featured: (a, b) =>
    Number(b.featured) - Number(a.featured) ||
    Number(b.bestSeller) - Number(a.bestSeller) ||
    b.rating - a.rating,
};

export async function getProducts(options = {}) {
  const {
    category,
    subcategory,
    featured,
    bestSeller,
    newArrival,
    collection,
    search,
    sort = 'featured',
    limit,
    slugs,
  } = options;

  const where = { status: 'published' };
  if (category) where.category = { slug: category };
  if (subcategory) where.subcategory = { slug: subcategory };
  if (featured !== undefined) where.featured = featured;
  if (bestSeller !== undefined) where.bestSeller = bestSeller;
  if (newArrival !== undefined) where.newArrival = newArrival;
  if (collection) where.collections = { some: { slug: collection } };
  if (slugs?.length) where.slug = { in: slugs };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { type: { contains: search, mode: 'insensitive' } },
      { category: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const records = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: { createdAt: 'desc' },
    take: limit || undefined,
  });

  const mapped = records.map(mapProduct);
  const sorter = PRODUCT_SORTS[sort] || PRODUCT_SORTS.featured;
  mapped.sort(sorter);
  return mapped;
}

export async function getProductBySlug(slug) {
  if (!slug) return null;
  const product = await prisma.product.findFirst({
    where: { slug, status: 'published' },
    include: productInclude,
  });
  return product ? mapProduct(product) : null;
}

export async function getRelatedProducts(product, limit = 6) {
  if (!product) return [];
  const sameCategory = await getProducts({ category: product.category, limit: 12 });
  const same = sameCategory.filter((item) => item.slug !== product.slug);
  if (same.length >= limit) return same.slice(0, limit);
  const fillers = await getProducts({ bestSeller: true, limit: 12 });
  const seen = new Set([product.slug, ...same.map((item) => item.slug)]);
  for (const filler of fillers) {
    if (seen.has(filler.slug)) continue;
    seen.add(filler.slug);
    same.push(filler);
    if (same.length >= limit) break;
  }
  return same;
}

export async function getCategories() {
  const records = await prisma.category.findMany({
    where: { status: 'published', parentId: null },
    include: {
      children: {
        where: { status: 'published' },
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      },
      _count: { select: { products: true } },
    },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });
  return records.map((record) => mapCategory(record, record.children));
}

export async function getAllCategories() {
  const records = await prisma.category.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });
  return records.map((record) => mapCategory(record));
}

export async function getCategoryBySlug(slug) {
  if (!slug) return null;
  const record = await prisma.category.findFirst({
    where: { slug, status: 'published' },
    include: {
      children: {
        where: { status: 'published' },
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      },
      parent: true,
    },
  });
  if (!record) return null;
  const category = mapCategory(record, record.children);
  category.parent = record.parent
    ? { slug: record.parent.slug, name: record.parent.name }
    : null;
  return category;
}

export async function getSubcategory(categorySlug, subcategorySlug) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;
  const subcategory = category.subcategories.find((sub) => sub.slug === subcategorySlug);
  if (!subcategory) return null;
  return { ...subcategory, category };
}

export async function getCollections() {
  const records = await prisma.collection.findMany({
    where: { status: 'published' },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  });
  return records.map(mapCollection);
}

export async function getCollectionBySlug(slug) {
  if (!slug) return null;
  const record = await prisma.collection.findFirst({
    where: { slug, status: 'published' },
    include: { _count: { select: { products: true } } },
  });
  return record ? mapCollection(record) : null;
}

export async function getBanners() {
  const now = new Date();
  const records = await prisma.banner.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  return records.map(mapBanner);
}

export async function getTestimonials(limit) {
  const records = await prisma.testimonial.findMany({
    where: { status: 'published' },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    take: limit || undefined,
  });
  return records.map(mapTestimonial);
}

export async function getFaqs(limit) {
  const records = await prisma.faq.findMany({
    where: { status: 'published' },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    take: limit || undefined,
  });
  return records.map(mapFaq);
}

export async function getPage(slug) {
  if (!slug) return null;
  return prisma.page.findFirst({
    where: { slug, status: 'published' },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
}

export async function getBlogs(limit) {
  return prisma.blog.findMany({
    where: { status: 'published' },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit || undefined,
  });
}

export async function getBlogBySlug(slug) {
  if (!slug) return null;
  return prisma.blog.findFirst({ where: { slug, status: 'published' } });
}
