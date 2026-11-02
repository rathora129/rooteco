import PageHero from '@/components/common/PageHero';
import HamperBuilder from '@/components/hamper/HamperBuilder';
import { getProducts } from '@/lib/catalog';

export const metadata = {
  title: 'Build Your Own Hamper',
  description:
    'Pick a box, choose your gifts, add branding and build a custom corporate hamper with RootEco.',
};

export default async function BuildHamperPage() {
  const products = await getProducts();
  return (
    <>
      <PageHero
        eyebrow="Make it yours"
        title="Build Your Own Hamper"
        subtitle="Choose a box, fill it with gifts, add your branding and a gift note. We curate, pack and deliver — with a mock-up approval before production."
        crumbs={[{ label: 'Build Your Own Hamper' }]}
      />
      <HamperBuilder products={products} />
    </>
  );
}
