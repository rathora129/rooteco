import { notFound } from 'next/navigation';
import { getCollectionBySlug, getProducts } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { absoluteUrl } from '@/lib/seo';
import CollectionDetail from '@/components/pages/CollectionDetail';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [collection, settings] = await Promise.all([getCollectionBySlug(slug), getSettings()]);
  if (!collection) return { title: 'Collection not found' };
  const description =
    collection.seoDescription || collection.description || settings.seo?.defaultDescription;
  return {
    title: collection.seoTitle ? { absolute: collection.seoTitle } : collection.name,
    description,
    alternates: { canonical: absoluteUrl(`/collections/${collection.slug}`, settings) },
    openGraph: {
      title: collection.seoTitle || collection.name,
      description,
      images: collection.image ? [{ url: collection.image }] : undefined,
    },
  };
}

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();
  const products = await getProducts({ collection: slug });
  return <CollectionDetail collection={collection} products={products} />;
}
