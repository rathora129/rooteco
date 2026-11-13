'use client';

import CmsSections from '@/components/pages/CmsSections';
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
import { isSectionVisible } from '@/lib/cms';
import { sectionLayout, sectionLayoutKey } from '@/lib/pages/layouts';

function contentOf(section) {
  const data = section.data || {};
  return {
    eyebrow: data.subheading || '',
    heading: section.heading || '',
    body: section.body || '',
    image: section.image || '',
    label: data.label || '',
    href: data.href || '',
    target: data.target || '',
    cream: Boolean(data.cream),
    reverse: Boolean(data.reverse),
    ...data,
  };
}

export default function HomeLayout({ sections = [], data = {} }) {
  const visible = sections.filter(isSectionVisible);

  return visible.map((section) => {
    const layout = sectionLayout(section);
    const content = contentOf(section);
    const key = section.id || sectionLayoutKey(section) || `${layout}-${section.order}`;

    if (!layout) return <CmsSections key={key} sections={[section]} />;

    switch (layout) {
      case 'home-hero':
        return <HeroSlider key={key} banners={data.banners || []} />;
      case 'logo-strip':
        return <TrustedBy key={key} />;
      case 'category-grid':
        return <WhatWeDo key={key} categories={data.categories || []} content={content} />;
      case 'product-row': {
        const products =
          data[content.source] || (content.source === 'featured' ? data.featured : []);
        const fallback =
          content.source === 'newArrival'
            ? data.newArrivals
            : content.source === 'bestSeller'
              ? data.bestSellers
              : data.featured;
        return (
          <ProductSection
            key={key}
            eyebrow={content.eyebrow}
            title={content.heading}
            subtitle={content.body}
            products={products?.length ? products : fallback || []}
            viewAllLink={content.link || content.href || '/products'}
            viewAllLabel={content.label || 'View All'}
            cream={content.cream}
          />
        );
      }
      case 'festival-gifting':
        return <FestivalGifting key={key} collections={data.collections || []} content={content} />;
      case 'process-timeline':
        return <ProcessTimeline key={key} content={content} />;
      case 'feature-split':
        return <AllFeatures key={key} content={content} />;
      case 'hamper-banner':
        return <HamperBanner key={key} content={content} />;
      case 'testimonial-grid':
        return <WallOfLove key={key} testimonials={data.testimonials || []} content={content} />;
      case 'office-grid':
        return <OfficesSection key={key} content={content} />;
      case 'editorial-swag':
        return <SwagIsAlways key={key} content={content} />;
      case 'editorial-corporate':
        return <CorporateMadeEasy key={key} content={content} />;
      case 'home-faq':
        return (
          <HomeFaq
            key={key}
            faqs={data.faqs || []}
            email={data.email}
            content={content}
          />
        );
      default:
        return <CmsSections key={key} sections={[section]} />;
    }
  });
}
