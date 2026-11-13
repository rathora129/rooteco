'use client';

import { Container, Section } from '@/components/common/ui';
import PageSections from '@/components/pages/PageSections';
import { visibleSections } from '@/lib/cms';
import { sectionLayout } from '@/lib/pages/layouts';

export default function CmsSections({ sections }) {
  const generic = visibleSections(sections).filter((section) => !sectionLayout(section));
  if (!generic.length) return null;

  return (
    <Section style={{ paddingTop: 0 }}>
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
          <PageSections sections={generic} />
        </div>
      </Container>
    </Section>
  );
}
