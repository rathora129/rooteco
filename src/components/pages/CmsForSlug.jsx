import CmsSections from '@/components/pages/CmsSections';
import { getPage } from '@/lib/catalog';
import { visibleSections } from '@/lib/cms';

export default async function CmsForSlug({ slug }) {
  const page = await getPage(slug);
  return <CmsSections sections={visibleSections(page?.sections)} />;
}
