import HeroSlider from '@/components/home/HeroSlider';
import TrustedBy from '@/components/home/TrustedBy';
import WhatWeDo from '@/components/home/WhatWeDo';
import ProductSection from '@/components/home/ProductSection';
import FestivalGifting from '@/components/home/FestivalGifting';
import ProcessTimeline from '@/components/home/ProcessTimeline';
import AllFeatures from '@/components/home/AllFeatures';
import HamperBanner from '@/components/home/HamperBanner';
import WallOfLove from '@/components/home/WallOfLove';
import OfficesSection from '@/components/home/OfficesSection';
import { SwagIsAlways, CorporateMadeEasy, HomeFaq } from '@/components/home/EditorialSections';
import {
  getBanners,
  getCategories,
  getCollections,
  getFaqs,
  getProducts,
  getTestimonials,
} from '@/lib/catalog';
import { getSettings } from '@/lib/settings';

export default async function HomePage() {
  const [banners, categories, collections, featured, newArrivals, bestSellers, testimonials, faqs, settings] =
    await Promise.all([
      getBanners(),
      getCategories(),
      getCollections(),
      getProducts({ featured: true, limit: 12 }),
      getProducts({ newArrival: true, limit: 12 }),
      getProducts({ bestSeller: true, limit: 12 }),
      getTestimonials(),
      getFaqs(6),
      getSettings(),
    ]);

  return (
    <>
      <HeroSlider banners={banners} />
      <TrustedBy />
      <WhatWeDo categories={categories} />
      <ProductSection
        eyebrow="Corporate Gifting"
        title="Great employees deserve this"
        subtitle="Welcome kits, tech and essentials — curated for your team."
        products={featured}
        viewAllLink="/products"
        cream
      />
      <FestivalGifting collections={collections} />
      <ProductSection
        eyebrow="New Arrivals"
        title="Just landed for your team"
        subtitle="Fresh additions to the catalogue — ready for branding and bulk orders."
        products={newArrivals}
        viewAllLink="/products?sort=newest"
        cream
      />
      <ProductSection
        eyebrow="Best Seller"
        title="Our most-loved products"
        subtitle="The gifts companies reorder, year after year."
        products={bestSellers}
        viewAllLink="/products?sort=best-selling"
      />
      <ProcessTimeline />
      <AllFeatures />
      <HamperBanner />
      <WallOfLove testimonials={testimonials} />
      <OfficesSection />
      <SwagIsAlways />
      <CorporateMadeEasy />
      <HomeFaq faqs={faqs} email={settings.contact.email} />
    </>
  );
}
