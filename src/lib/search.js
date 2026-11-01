import products from '@/data/products';
import categories from '@/data/categories';

export function searchProducts(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) => {
    const cat = categories.find((c) => c.slug === p.category);
    const sub = cat?.subcategories.find((s) => s.slug === p.subcategory);
    return [p.name, p.description, p.type, cat?.name, sub?.name, ...(p.occasions || [])]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q));
  });
}

export const popularSearches = [
  'Diwali hamper',
  'Welcome kit',
  'Bottle',
  'Notebook',
  'Hoodie',
  'Gift set',
  'Eco-friendly',
  'Tech',
];
