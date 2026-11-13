/* eslint-disable @next/next/no-img-element */
'use client';

import { BookOpen, CircleHelp, Megaphone, Quote, Star } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/ui';
import Workspace, { DetailList, DetailRow, DetailSection } from '@/components/dashboard/Workspace';
import { formatDate } from '@/components/dashboard/hooks';

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

function Thumb({ src, label, size = 34 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: src ? `#fff url(${src}) center / cover no-repeat` : 'var(--dash-panel-3)',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--dash-faint)',
        fontSize: 10,
        fontWeight: 700,
        flexShrink: 0,
        border: '1px solid var(--dash-line-soft)',
      }}
    >
      {!src && String(label || '?').slice(0, 2).toUpperCase()}
    </span>
  );
}

function NameCell({ image, name, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
      <Thumb src={image} label={name} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--dash-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </div>
        {sub && <div style={{ color: 'var(--dash-faint)', fontSize: 10.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
      </div>
    </div>
  );
}

function Rating({ value }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--dash-accent)', fontSize: 12, fontWeight: 600 }}>
      <Star size={12} fill="currentColor" /> {value || 0}
    </span>
  );
}

export function BannersModule() {
  const fields = [
    { name: 'title', label: 'Banner title', required: true, section: 'Content', full: true },
    { name: 'kicker', label: 'Kicker', placeholder: 'Diwali 2026' },
    { name: 'subtitle', label: 'Subtitle', type: 'textarea', full: true },
    { name: 'desktopImage', label: 'Desktop image', type: 'image', required: true, section: 'Creative' },
    { name: 'mobileImage', label: 'Mobile image', type: 'image', hint: 'Falls back to desktop image when empty' },
    { name: 'accent', label: 'Accent', type: 'select', options: [{ value: 'gold', label: 'Gold' }, { value: 'green', label: 'Green' }, { value: 'cream', label: 'Cream' }] },
    { name: 'primaryLabel', label: 'Primary button label', required: true, section: 'Actions' },
    { name: 'primaryUrl', label: 'Primary button URL', required: true, placeholder: '/collections/diwali' },
    { name: 'secondaryLabel', label: 'Secondary button label' },
    { name: 'secondaryUrl', label: 'Secondary button URL', placeholder: '/products' },
    { name: 'order', label: 'Sort order', type: 'number', min: 0, section: 'Schedule' },
    { name: 'startDate', label: 'Starts', type: 'date' },
    { name: 'endDate', label: 'Ends', type: 'date' },
    { name: 'active', label: 'Active', type: 'checkbox', checkboxLabel: 'Show this banner on the storefront' },
  ];

  const columns = [
    { key: 'title', label: 'Banner', width: 300, render: (row) => <NameCell image={row.desktopImage} name={row.title} sub={row.kicker || row.subtitle} /> },
    { key: 'primary', label: 'Primary action', render: (row) => <span>{row.primaryLabel} → <span className="muted">{row.primaryUrl}</span></span> },
    {
      key: 'schedule',
      label: 'Schedule',
      render: (row) => (row.startDate || row.endDate ? `${formatDate(row.startDate)} – ${formatDate(row.endDate)}` : 'Always on'),
    },
    { key: 'order', label: 'Order' },
    { key: 'active', label: 'Status', render: (row) => <StatusBadge value={row.active ? 'active' : 'inactive'} /> },
  ];

  return (
    <Workspace
      eyebrow="Website Studio"
      title="Banners"
      description="Hero banners and promotional sliders. Control the creative, call to action and the exact window each banner is live."
      endpoint="/api/banners"
      itemLabel="banner"
      columns={columns}
      fields={fields}
      defaults={{ active: true, accent: 'gold', order: 0 }}
      filters={[{ name: 'active', label: 'All banners', options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] }]}
      sortOptions={[
        { value: 'order', label: 'Display order', sort: 'order', order: 'asc' },
        { value: 'newest', label: 'Newest first', sort: 'createdAt', order: 'desc' },
      ]}
      searchPlaceholder="Search banners…"
      createLabel="Add banner"
      itemLabelPlural="banners"
      emptyTitle="No banners yet"
      emptyText="Create a banner to feature a campaign on the homepage."
      emptyIcon={<Megaphone size={19} />}
      viewModes={['table', 'grid']}
      renderCard={(row) => (
        <>
          <span style={{ display: 'block', height: 120, background: row.desktopImage ? `#fff url(${row.desktopImage}) center / cover no-repeat` : 'var(--dash-panel-2)' }} />
          <span style={{ display: 'block', padding: 12 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
              <strong style={{ fontSize: 12.5, color: 'var(--dash-ink)' }}>{row.title}</strong>
              <StatusBadge value={row.active ? 'active' : 'inactive'} />
            </span>
            <span style={{ display: 'block', marginTop: 5, fontSize: 11, color: 'var(--dash-faint)' }}>{row.kicker || row.subtitle || 'No kicker'}</span>
          </span>
        </>
      )}
      renderDetail={(row) => (
        <>
          {row.desktopImage && (
            <div style={{ height: 170, borderRadius: 10, marginBottom: 18, background: `#fff url(${row.desktopImage}) center / cover no-repeat`, border: '1px solid var(--dash-line)' }} />
          )}
          <DetailSection title="Banner">
            <DetailList>
              <DetailRow label="Title">{row.title}</DetailRow>
              <DetailRow label="Kicker">{row.kicker || '—'}</DetailRow>
              <DetailRow label="Subtitle">{row.subtitle || '—'}</DetailRow>
              <DetailRow label="Status"><StatusBadge value={row.active ? 'active' : 'inactive'} /></DetailRow>
              <DetailRow label="Accent">{row.accent}</DetailRow>
              <DetailRow label="Order">{row.order}</DetailRow>
              <DetailRow label="Schedule">{row.startDate || row.endDate ? `${formatDate(row.startDate)} – ${formatDate(row.endDate)}` : 'Always on'}</DetailRow>
            </DetailList>
          </DetailSection>
          <DetailSection title="Calls to action">
            <DetailList>
              <DetailRow label="Primary">{row.primaryLabel} → {row.primaryUrl}</DetailRow>
              <DetailRow label="Secondary">{row.secondaryLabel ? `${row.secondaryLabel} → ${row.secondaryUrl}` : '—'}</DetailRow>
            </DetailList>
          </DetailSection>
        </>
      )}
    />
  );
}

export function BlogsModule() {
  const fields = [
    { name: 'title', label: 'Post title', required: true, section: 'Article', full: true },
    { name: 'slug', label: 'URL slug', hint: 'Auto-generated when blank' },
    { name: 'category', label: 'Category', placeholder: 'Gifting guides' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', full: true },
    { name: 'content', label: 'Article content', type: 'textarea', full: true, tall: true, placeholder: 'Write the article. Basic paragraphs and line breaks are preserved.' },
    { name: 'image', label: 'Cover image', type: 'image', section: 'Media' },
    { name: 'author', label: 'Author', placeholder: 'RootEco Team' },
    { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'corporate gifting, diwali' },
    { name: 'publishedAt', label: 'Publish date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS, section: 'Publishing' },
    { name: 'seoTitle', label: 'SEO title', full: true, section: 'Search & sharing' },
    { name: 'seoDescription', label: 'SEO description', type: 'textarea', full: true },
  ];

  const columns = [
    { key: 'title', label: 'Post', width: 320, render: (row) => <NameCell image={row.image} name={row.title} sub={`/blog/${row.slug}`} /> },
    { key: 'category', label: 'Category', render: (row) => row.category || '—' },
    { key: 'author', label: 'Author', render: (row) => row.author || 'RootEco Team' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'publishedAt', label: 'Published', render: (row) => formatDate(row.publishedAt) },
  ];

  return (
    <Workspace
      eyebrow="Marketing"
      title="Blog"
      description="Publish gifting guides, case studies and seasonal stories that bring organic traffic to the storefront."
      endpoint="/api/blogs"
      itemLabel="post"
      columns={columns}
      fields={fields}
      defaults={{ status: 'draft', author: 'RootEco Team', tags: [] }}
      filters={[{ name: 'status', label: 'All statuses', options: STATUS_OPTIONS }]}
      sortOptions={[
        { value: 'published', label: 'Newest published', sort: 'publishedAt', order: 'desc' },
        { value: 'title', label: 'Title A–Z', sort: 'title', order: 'asc' },
        { value: 'newest', label: 'Recently created', sort: 'createdAt', order: 'desc' },
      ]}
      searchPlaceholder="Search posts by title, excerpt or category…"
      createLabel="New post"
      itemLabelPlural="posts"
      emptyTitle="No blog posts yet"
      emptyText="Write your first article to start building organic search traffic."
      emptyIcon={<BookOpen size={19} />}
      liveHref={(row) => `/blog/${row.slug}`}
      renderDetail={(row) => (
        <>
          {row.image && (
            <div style={{ height: 160, borderRadius: 10, marginBottom: 18, background: `#fff url(${row.image}) center / cover no-repeat`, border: '1px solid var(--dash-line)' }} />
          )}
          <DetailSection title="Post">
            <DetailList>
              <DetailRow label="Title">{row.title}</DetailRow>
              <DetailRow label="Slug">/blog/{row.slug}</DetailRow>
              <DetailRow label="Category">{row.category || '—'}</DetailRow>
              <DetailRow label="Author">{row.author || 'RootEco Team'}</DetailRow>
              <DetailRow label="Status"><StatusBadge value={row.status} /></DetailRow>
              <DetailRow label="Published">{formatDate(row.publishedAt)}</DetailRow>
              <DetailRow label="Tags">{row.tags?.join(', ') || '—'}</DetailRow>
            </DetailList>
          </DetailSection>
          {row.excerpt && <DetailSection title="Excerpt"><p style={{ fontSize: 12.5, color: 'var(--dash-muted)', lineHeight: 1.65 }}>{row.excerpt}</p></DetailSection>}
          <DetailSection title="Content">
            <p style={{ fontSize: 12.5, color: 'var(--dash-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{row.content}</p>
          </DetailSection>
        </>
      )}
      exportName="blog-posts"
    />
  );
}

export function TestimonialsModule() {
  const fields = [
    { name: 'client', label: 'Client name', required: true, section: 'Review' },
    { name: 'company', label: 'Company' },
    { name: 'designation', label: 'Designation' },
    { name: 'rating', label: 'Rating', type: 'number', min: 1, max: 5, step: 1 },
    { name: 'review', label: 'Review', type: 'textarea', full: true, required: true },
    { name: 'image', label: 'Photo', type: 'image', section: 'Media' },
    { name: 'order', label: 'Sort order', type: 'number', min: 0, section: 'Placement' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS },
  ];

  const columns = [
    { key: 'client', label: 'Client', width: 260, render: (row) => <NameCell image={row.image} name={row.client} sub={[row.designation, row.company].filter(Boolean).join(' · ')} /> },
    { key: 'review', label: 'Review', render: (row) => <span style={{ display: 'block', maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--dash-muted)' }}>{row.review}</span> },
    { key: 'rating', label: 'Rating', render: (row) => <Rating value={row.rating} /> },
    { key: 'order', label: 'Order' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
  ];

  return (
    <Workspace
      eyebrow="Marketing"
      title="Testimonials"
      description="Client proof for the wall of love and product pages. Keep ratings, attribution and photos accurate."
      endpoint="/api/testimonials"
      itemLabel="testimonial"
      columns={columns}
      fields={fields}
      defaults={{ status: 'published', rating: 5, order: 0 }}
      filters={[{ name: 'status', label: 'All statuses', options: STATUS_OPTIONS }]}
      sortOptions={[
        { value: 'order', label: 'Display order', sort: 'order', order: 'asc' },
        { value: 'rating', label: 'Highest rated', sort: 'rating', order: 'desc' },
        { value: 'newest', label: 'Newest first', sort: 'createdAt', order: 'desc' },
      ]}
      searchPlaceholder="Search testimonials…"
      createLabel="Add testimonial"
      itemLabelPlural="testimonials"
      emptyTitle="No testimonials yet"
      emptyText="Add a client review to build social proof."
      emptyIcon={<Quote size={19} />}
      renderDetail={(row) => (
        <>
          <DetailSection title="Client">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Thumb src={row.image} label={row.client} size={54} />
              <div>
                <div style={{ fontWeight: 650, fontSize: 14, color: 'var(--dash-ink)' }}>{row.client}</div>
                <div style={{ fontSize: 11.5, color: 'var(--dash-muted)' }}>{[row.designation, row.company].filter(Boolean).join(' · ') || '—'}</div>
                <div style={{ marginTop: 4 }}><Rating value={row.rating} /></div>
              </div>
            </div>
            <blockquote style={{ borderLeft: '2px solid var(--dash-accent)', paddingLeft: 12, fontSize: 13, color: 'var(--dash-ink)', lineHeight: 1.7 }}>
              {row.review}
            </blockquote>
          </DetailSection>
          <DetailSection title="Placement">
            <DetailList>
              <DetailRow label="Status"><StatusBadge value={row.status} /></DetailRow>
              <DetailRow label="Order">{row.order}</DetailRow>
              <DetailRow label="Created">{formatDate(row.createdAt)}</DetailRow>
            </DetailList>
          </DetailSection>
        </>
      )}
    />
  );
}

export function FaqsModule() {
  const fields = [
    { name: 'question', label: 'Question', required: true, full: true, section: 'FAQ' },
    { name: 'answer', label: 'Answer', type: 'textarea', required: true, full: true, tall: true },
    { name: 'category', label: 'Category', placeholder: 'Orders & delivery' },
    { name: 'order', label: 'Sort order', type: 'number', min: 0 },
    { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS, section: 'Publishing' },
  ];

  const columns = [
    { key: 'question', label: 'Question', width: 380, render: (row) => <span style={{ fontWeight: 600, color: 'var(--dash-ink)' }}>{row.question}</span> },
    { key: 'answer', label: 'Answer', render: (row) => <span style={{ display: 'block', maxWidth: 380, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--dash-muted)' }}>{row.answer}</span> },
    { key: 'category', label: 'Category', render: (row) => row.category || 'General' },
    { key: 'order', label: 'Order' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
  ];

  return (
    <Workspace
      eyebrow="Marketing"
      title="FAQs"
      description="Answer the questions that block a purchase. FAQs appear on the help page and in product guidance."
      endpoint="/api/faqs"
      itemLabel="FAQ"
      itemLabelPlural="FAQs"
      columns={columns}
      fields={fields}
      defaults={{ status: 'published', order: 0 }}
      filters={[{ name: 'status', label: 'All statuses', options: STATUS_OPTIONS }]}
      sortOptions={[
        { value: 'order', label: 'Display order', sort: 'order', order: 'asc' },
        { value: 'newest', label: 'Newest first', sort: 'createdAt', order: 'desc' },
      ]}
      searchPlaceholder="Search questions and answers…"
      createLabel="Add FAQ"
      emptyTitle="No FAQs yet"
      emptyText="Add the questions customers ask most often."
      emptyIcon={<CircleHelp size={19} />}
      renderDetail={(row) => (
        <>
          <DetailSection title="Question">
            <h3 style={{ fontSize: 15, fontWeight: 650, color: 'var(--dash-ink)', lineHeight: 1.5 }}>{row.question}</h3>
          </DetailSection>
          <DetailSection title="Answer">
            <p style={{ fontSize: 12.5, color: 'var(--dash-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{row.answer}</p>
          </DetailSection>
          <DetailSection title="Placement">
            <DetailList>
              <DetailRow label="Category">{row.category || 'General'}</DetailRow>
              <DetailRow label="Status"><StatusBadge value={row.status} /></DetailRow>
              <DetailRow label="Order">{row.order}</DetailRow>
              <DetailRow label="Created">{formatDate(row.createdAt)}</DetailRow>
            </DetailList>
          </DetailSection>
        </>
      )}
    />
  );
}
