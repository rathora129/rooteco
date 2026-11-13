'use client';

import { useEffect, useState } from 'react';
import CmsPage from '@/components/pages/CmsPage';
import theme from '@/styles/theme';

export default function PagePreview({ page }) {
  const [draft, setDraft] = useState(page);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`rooteco:page-preview:${page.id}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // localStorage is only readable after mount, so the saved page renders first and the draft overlays it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (parsed?.page?.id === page.id) setDraft(parsed.page);
    } catch {
      // Fall back to the saved page when a stale or invalid preview payload exists.
    }
  }, [page.id]);

  return (
    <>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '9px 16px',
          background: theme.colors.gold,
          color: theme.colors.forest,
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}
      >
        Draft preview — not visible to customers
      </div>
      <CmsPage page={draft} preview />
    </>
  );
}
