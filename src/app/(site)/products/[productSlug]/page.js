import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
  getCategories,
  getFaqs,
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/catalog';
import ProductDetail from '@/components/products/ProductDetail';
import PageLoading from '@/components/common/PageLoading';
import { getSettings } from '@/lib/settings';
import { absoluteUrl } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { productSlug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(productSlug), getSettings()]);
  if (!product) return { title: 'Product not found' };
  const description = product.seoDescription || product.description;
  const image = product.images[0] ? absoluteUrl(product.images[0], settings) : undefined;
  return {
    title: product.seoTitle ? { absolute: product.seoTitle } : product.name,
    description,
    alternates: { canonical: absoluteUrl(`/products/${product.slug}`, settings) },
    openGraph: {
      title: product.seoTitle || product.name,
      description,
      url: absoluteUrl(`/products/${product.slug}`, settings),
      images: image ? [{ url: image }] : undefined,
    },
  };
}

async function ProductContent({ params }) {
  const { productSlug } = await params;
  const product = await getProductBySlug(productSlug);
  if (!product) notFound();

  const [related, categories, faqs] = await Promise.all([
    getRelatedProducts(product),
    getCategories(),
    getFaqs(8),
  ]);

  return (
    <ProductDetail
      product={product}
      related={related}
      categories={categories}
      faqs={faqs}
    />
  );
}

export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<PageLoading label="Loading product…" />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
