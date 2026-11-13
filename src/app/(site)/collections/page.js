import { getCollections, getPage } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { absoluteUrl } from '@/lib/seo';
import CollectionsIndex from '@/components/pages/CollectionsIndex';

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: 'Collections',
    description:
      settings.seo?.defaultDescription ||
      'Curated corporate gifting collections for festivals, onboarding and celebrations by RootEco.',
    alternates: { canonical: absoluteUrl('/collections', settings) },
  };
}

export default async function CollectionsPage() {
  const [collections, page] = await Promise.all([getCollections(), getPage('collections')]);
  return <CollectionsIndex collections={collections} sections={page?.sections} />;
}
