'use client';

import { Container, Section } from '@/components/common/ui';
import PageSections from '@/components/pages/PageSections';
import { visibleSections } from '@/lib/cms';

export default function CmsSections({ sections }) {
  if (!visibleSections(sections).length) return null;

  return (
    <Section style={{ paddingTop: 0 }}>
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
          <PageSections sections={sections} />
        </div>
      </Container>
    </Section>
  );
}
