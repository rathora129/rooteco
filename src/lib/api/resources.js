import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import {
  bannerSchema,
  blogSchema,
  categorySchema,
  collectionSchema,
  couponSchema,
  faqSchema,
  pageSchema,
  productSchema,
  testimonialSchema,
} from '@/lib/validation';

async function uniqueSlug(model, source, currentId) {
  const base = slugify(source) || `item-${Date.now().toString(36)}`;
  let slug = base;
  let suffix = 2;
  while (
    await prisma[model].findFirst({
      where: { slug, ...(currentId ? { NOT: { id: currentId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function withoutRelationKeys(data, keys) {
  const copy = { ...data };
  for (const key of keys) delete copy[key];
  return copy;
}

function relationLinks(ids, mode) {
  if (mode === 'create') {
    return ids.length ? { connect: ids.map((id) => ({ id })) } : null;
  }
  return { set: ids.map((id) => ({ id })) };
}

export const productResource = {
  model: 'product',
  schema: productSchema,
  publicRead: true,
  searchFields: ['name', 'sku', 'shortDescription', 'description'],
  filterFields: ['status', 'featured', 'bestSeller', 'newArrival', 'categoryId', 'subcategoryId', 'type'],
  sortFields: ['createdAt', 'name', 'price', 'salePrice', 'rating', 'stock'],
  sortMap: {
    newest: { createdAt: 'desc' },
    'price-low': [{ salePrice: 'asc' }, { price: 'asc' }],
    'price-high': [{ salePrice: 'desc' }, { price: 'desc' }],
    'best-selling': [{ bestSeller: 'desc' }, { createdAt: 'desc' }],
    rating: [{ rating: 'desc' }],
  },
  defaultOrderBy: { createdAt: 'desc' },
  include: {
    category: { select: { id: true, name: true, slug: true } },
    subcategory: { select: { id: true, name: true, slug: true } },
    collections: { select: { id: true, name: true, slug: true } },
  },
  publicWhere: { status: 'published' },
  async buildWhere({ searchParams }) {
    const conditions = [];
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const collection = searchParams.get('collection');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    if (category) conditions.push({ category: { slug: category } });
    if (subcategory) conditions.push({ subcategory: { slug: subcategory } });
    if (collection) conditions.push({ collections: { some: { slug: collection } } });
    if (minPrice || maxPrice) {
      conditions.push({
        price: {
          ...(minPrice ? { gte: Number(minPrice) } : {}),
          ...(maxPrice ? { lte: Number(maxPrice) } : {}),
        },
      });
    }
    if (!conditions.length) return null;
    return conditions.length === 1 ? conditions[0] : { AND: conditions };
  },
  async prepareInput(data, { mode, id }) {
    const collectionIds = data.collectionIds;
    const clean = withoutRelationKeys(data, ['collectionIds']);
    if (!clean.slug) {
      clean.slug = await uniqueSlug('product', clean.name, id);
    } else {
      clean.slug = slugify(clean.slug);
    }
    if (!clean.sku) {
      clean.sku = `RE-${clean.slug.slice(0, 14).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    }
    if (mode === 'create' && clean.stockStatus === undefined) {
      clean.stockStatus = clean.stock > 0 ? 'in' : 'out';
    }
    if (Array.isArray(collectionIds)) {
      const collections = relationLinks(collectionIds, mode);
      if (collections) clean.collections = collections;
    }
    return clean;
  },
};

export const categoryResource = {
  model: 'category',
  schema: categorySchema,
  publicRead: true,
  searchFields: ['name', 'tagline', 'description'],
  filterFields: ['status', 'parentId', 'homeCard'],
  sortFields: ['name', 'order', 'createdAt'],
  defaultOrderBy: [{ order: 'asc' }, { name: 'asc' }],
  include: {
    parent: { select: { id: true, name: true, slug: true } },
    children: { orderBy: { order: 'asc' }, select: { id: true, name: true, slug: true } },
    _count: { select: { products: true } },
  },
  publicWhere: { status: 'published' },
  async prepareInput(data, { mode, id }) {
    const clean = { ...data };
    if (!clean.slug) clean.slug = await uniqueSlug('category', clean.name, id);
    else clean.slug = slugify(clean.slug);
    if (id && clean.parentId === id) clean.parentId = null;
    if (mode === 'create' && clean.status === undefined) clean.status = 'published';
    return clean;
  },
};

export const collectionResource = {
  model: 'collection',
  schema: collectionSchema,
  publicRead: true,
  searchFields: ['name', 'description'],
  filterFields: ['status'],
  sortFields: ['name', 'order', 'createdAt'],
  defaultOrderBy: [{ order: 'asc' }, { name: 'asc' }],
  include: {
    products: {
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        price: true,
        salePrice: true,
        status: true,
      },
    },
    _count: { select: { products: true } },
  },
  publicWhere: { status: 'published' },
  async prepareInput(data, { mode, id }) {
    const productIds = data.productIds;
    const clean = withoutRelationKeys(data, ['productIds']);
    if (!clean.slug) clean.slug = await uniqueSlug('collection', clean.name, id);
    else clean.slug = slugify(clean.slug);
    if (Array.isArray(productIds)) {
      const products = relationLinks(productIds, mode);
      if (products) clean.products = products;
    }
    if (mode === 'create' && clean.status === undefined) clean.status = 'published';
    return clean;
  },
};

export const bannerResource = {
  model: 'banner',
  schema: bannerSchema,
  publicRead: true,
  searchFields: ['title', 'kicker', 'subtitle'],
  filterFields: ['active'],
  sortFields: ['order', 'createdAt'],
  defaultOrderBy: [{ order: 'asc' }],
  publicWhere: { active: true },
  async buildWhere({ isAdmin }) {
    if (isAdmin) return null;
    const now = new Date();
    return {
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    };
  },
  async prepareInput(data, { mode }) {
    if (mode === 'create' && data.active === undefined) data.active = true;
    if (mode === 'create' && data.accent === undefined) data.accent = 'gold';
    return data;
  },
};

export const blogResource = {
  model: 'blog',
  schema: blogSchema,
  publicRead: true,
  searchFields: ['title', 'excerpt', 'content', 'category'],
  filterFields: ['status', 'category'],
  sortFields: ['publishedAt', 'createdAt', 'title'],
  defaultOrderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  publicWhere: { status: 'published' },
  async prepareInput(data, { mode, id }) {
    const clean = { ...data };
    if (!clean.slug) clean.slug = await uniqueSlug('blog', clean.title, id);
    else clean.slug = slugify(clean.slug);
    if (clean.status === 'published' && !clean.publishedAt) clean.publishedAt = new Date();
    if (mode === 'create' && !clean.author) clean.author = 'RootEco Team';
    return clean;
  },
};

export const testimonialResource = {
  model: 'testimonial',
  schema: testimonialSchema,
  publicRead: true,
  searchFields: ['client', 'company', 'review'],
  filterFields: ['status'],
  sortFields: ['order', 'createdAt', 'rating'],
  defaultOrderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  publicWhere: { status: 'published' },
  async prepareInput(data, { mode }) {
    if (mode === 'create' && data.rating === undefined) data.rating = 5;
    if (mode === 'create' && data.status === undefined) data.status = 'published';
    return data;
  },
};

export const faqResource = {
  model: 'faq',
  schema: faqSchema,
  publicRead: true,
  searchFields: ['question', 'answer', 'category'],
  filterFields: ['status', 'category'],
  sortFields: ['order', 'createdAt'],
  defaultOrderBy: [{ order: 'asc' }],
  publicWhere: { status: 'published' },
  async prepareInput(data, { mode }) {
    if (mode === 'create' && data.status === undefined) data.status = 'published';
    return data;
  },
};

export const pageResource = {
  model: 'page',
  schema: pageSchema,
  publicRead: true,
  searchFields: ['title', 'slug', 'content'],
  filterFields: ['status'],
  sortFields: ['title', 'createdAt', 'updatedAt'],
  defaultOrderBy: { updatedAt: 'desc' },
  include: { sections: { orderBy: { order: 'asc' } } },
  publicWhere: { status: 'published' },
  async prepareInput(data, { mode, id }) {
    const sections = data.sections;
    const clean = withoutRelationKeys(data, ['sections']);
    if (!clean.slug) clean.slug = await uniqueSlug('page', clean.title, id);
    else clean.slug = slugify(clean.slug);
    if (mode === 'create' && clean.status === undefined) clean.status = 'published';
    if (Array.isArray(sections)) {
      const mapped = sections.map((section, index) => ({
        type: section.type || 'text',
        heading: section.heading || null,
        body: section.body || null,
        image: section.image || null,
        data: section.data ?? null,
        order: index,
      }));
      clean.sections =
        mode === 'create'
          ? { create: mapped }
          : { deleteMany: {}, create: mapped };
    }
    return clean;
  },
};

export const couponResource = {
  model: 'coupon',
  schema: couponSchema,
  publicRead: false,
  searchFields: ['code'],
  filterFields: ['active', 'type'],
  sortFields: ['createdAt', 'code', 'value'],
  defaultOrderBy: { createdAt: 'desc' },
  async prepareInput(data, { mode }) {
    const clean = { ...data, code: String(data.code || '').trim().toUpperCase() };
    if (mode === 'create' && clean.type === undefined) clean.type = 'percent';
    if (mode === 'create' && clean.active === undefined) clean.active = true;
    return clean;
  },
};
