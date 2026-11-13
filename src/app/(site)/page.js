import HomeLayout from '@/components/pages/HomeLayout';
import {
  getBanners,
  getCategories,
  getCollections,
  getFaqs,
  getPage,
  getProducts,
  getTestimonials,
} from '@/lib/catalog';
import { pageSections } from '@/lib/pages/page-sections';
import { getSettings } from '@/lib/settings';

export default async function HomePage() {
  const [
    banners,
    categories,
    collections,
    featured,
    newArrivals,
    bestSellers,
    testimonials,
    faqs,
    settings,
    page,
  ] = await Promise.all([
    getBanners(),
    getCategories(),
    getCollections(),
    getProducts({ featured: true, limit: 12 }),
    getProducts({ newArrival: true, limit: 12 }),
    getProducts({ bestSeller: true, limit: 12 }),
    getTestimonials(),
    getFaqs(6),
    getSettings(),
    getPage('home'),
  ]);

  return (
    <HomeLayout
      sections={pageSections('home', page?.sections)}
      data={{
        banners,
        categories,
        collections,
        featured,
        newArrivals,
        bestSellers,
        testimonials,
        faqs,
        email: settings.contact.email,
      }}
    />
  );
}
