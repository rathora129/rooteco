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
import { getFeatured, getBestSellers, getNewArrivals } from '@/data/products';

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <TrustedBy />
      <WhatWeDo />
      <ProductSection
        eyebrow="Corporate Gifting"
        title="Great employees deserve this"
        subtitle="Welcome kits, tech and essentials — curated for your team."
        products={getFeatured()}
        viewAllLink="/products"
        cream
      />
      <FestivalGifting />
      <ProductSection
        eyebrow="New Arrivals"
        title="Just landed for your team"
        subtitle="Fresh additions to the catalogue — ready for branding and bulk orders."
        products={getNewArrivals()}
        viewAllLink="/products?sort=newest"
        cream
      />
      <ProductSection
        eyebrow="Best Seller"
        title="Our most-loved products"
        subtitle="The gifts companies reorder, year after year."
        products={getBestSellers()}
        viewAllLink="/products?sort=best-selling"
      />
      <ProcessTimeline />
      <AllFeatures />
      <HamperBanner />
      <WallOfLove />
      <OfficesSection />
      <SwagIsAlways />
      <CorporateMadeEasy />
      <HomeFaq />
    </>
  );
}
