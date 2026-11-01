import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import products, {
  getProductBySlug,
  getProductsByCategory,
  getBestSellers,
} from '@/data/products';
import ProductDetail from '@/components/products/ProductDetail';
import PageLoading from '@/components/common/PageLoading';

export function generateStaticParams() {
  return products.map((product) => ({ productSlug: product.slug }));
}

export async function generateMetadata({ params }) {
  const { productSlug } = await params;
  const product = getProductBySlug(productSlug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | RootEco`,
      description: product.description,
      images: [{ url: product.images[0] }],
    },
  };
}

async function ProductContent({ params }) {
  const { productSlug } = await params;
  const product = getProductBySlug(productSlug);
  if (!product) notFound();

  const sameCategory = getProductsByCategory(product.category).filter(
    (p) => p.slug !== product.slug
  );
  const fillers = getBestSellers().filter(
    (p) => p.slug !== product.slug && !sameCategory.some((s) => s.slug === p.slug)
  );
  const related = [...sameCategory, ...fillers].slice(0, 6);

  return <ProductDetail product={product} related={related} />;
}

export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<PageLoading label="Loading product…" />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
