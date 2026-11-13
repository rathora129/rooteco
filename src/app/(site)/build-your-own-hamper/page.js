import PageHero from '@/components/common/PageHero';
import HamperBuilder from '@/components/hamper/HamperBuilder';
import { getPage, getProducts } from '@/lib/catalog';
import { heroFromSections } from '@/lib/pages/layouts';

export const metadata = {
  title: 'Build Your Own Hamper',
  description:
    'Pick a box, choose your gifts, add branding and build a custom corporate hamper with RootEco.',
};

export default async function BuildHamperPage() {
  const [products, page] = await Promise.all([getProducts(), getPage('build-your-own-hamper')]);
  const hero = heroFromSections(page?.sections, {
    eyebrow: 'Make it yours',
    title: 'Build Your Own Hamper',
    subtitle:
      'Choose a box, fill it with gifts, add your branding and a gift note. We curate, pack and deliver — with a mock-up approval before production.',
  });
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        crumbs={[{ label: 'Build Your Own Hamper' }]}
      />
      <HamperBuilder products={products} />
    </>
  );
}
