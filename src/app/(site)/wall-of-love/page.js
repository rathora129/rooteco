import WallOfLovePage from '@/components/pages/WallOfLovePage';
import { getTestimonials } from '@/lib/catalog';

export const metadata = {
  title: 'Wall of Love',
  description:
    'Customer stories from teams who trusted RootEco with their corporate gifting, festival hampers and onboarding kits.',
};

export default async function WallOfLoveRoute() {
  const testimonials = await getTestimonials();
  return <WallOfLovePage testimonials={testimonials} />;
}
