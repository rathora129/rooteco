import WallOfLovePage from '@/components/pages/WallOfLovePage';
import { getPage, getTestimonials } from '@/lib/catalog';

export const metadata = {
  title: 'Wall of Love',
  description:
    'Customer stories from teams who trusted RootEco with their corporate gifting, festival hampers and onboarding kits.',
};

export default async function WallOfLoveRoute() {
  const [testimonials, page] = await Promise.all([getTestimonials(), getPage('wall-of-love')]);
  return <WallOfLovePage testimonials={testimonials} sections={page?.sections} />;
}
