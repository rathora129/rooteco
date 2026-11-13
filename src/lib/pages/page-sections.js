import { visibleSections } from '@/lib/cms';
import { layoutDefaults } from '@/lib/pages/layouts';

export function pageSections(slug, sections) {
  const list = Array.isArray(sections) ? sections : [];
  if (!list.length) return layoutDefaults(slug);
  return visibleSections(list);
}
