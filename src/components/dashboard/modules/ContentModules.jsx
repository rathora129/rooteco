/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import GenericModule from '@/components/dashboard/GenericModule';
import { Badge, StatusBadge } from '@/components/dashboard/ui';
import { formatDate } from '@/components/dashboard/hooks';
import theme from '@/styles/theme';

function Thumb({ src, alt, wide = false }) {
  return src ? (
    <img
      src={src}
      alt={alt || ''}
      style={{
        width: wide ? 84 : 40,
        height: 40,
        borderRadius: 7,
        objectFit: 'cover',
        border: '1px solid #E3DCCB',
      }}
    />
  ) : (
    <span
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: wide ? 84 : 40,
        height: 40,
        borderRadius: 7,
        background: '#F6F1E7',
        color: '#5C6B62',
        fontSize: 10,
      }}
    >
      No img
    </span>
  );
}

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

export function PagesModule() {
  const fields = [
    { name: 'title', label: 'Page title', required: true },
    { name: 'slug', label: 'Slug', hint: 'Auto-generated from the title if blank' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: STATUS_OPTIONS,
    },
    { name: 'content', label: 'Main content', type: 'textarea', tall: true, full: true },
    { name: 'sections', label: 'Content sections', type: 'sections', full: true },
    { name: 'seoTitle', label: 'SEO title' },
    { name: 'seoDescription', label: 'SEO description', type: 'textarea' },
  ];

  return (
    <GenericModule
      eyebrow="Content"
      title="Website pages"
      description="Build CMS-driven pages with ordered sections, SEO metadata and draft or published visibility."
      endpoint="/api/content/pages"
      columns={[
        {
          key: 'title',
          label: 'Page',
          render: (row) => (
            <div>
              <Link href={`/pages/${row.slug}`} target="_blank" rel="noreferrer" className="strong" style={{ color: theme.colors.forest }}>
                {row.title}
              </Link>
              <div className="muted">/{row.slug}</div>
            </div>
          ),
        },
        {
          key: 'sections',
          label: 'Sections',
          render: (row) => <span>{row.sections?.length || 0}</span>,
        },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        {
          key: 'updatedAt',
          label: 'Updated',
          render: (row) => <span className="muted">{formatDate(row.updatedAt)}</span>,
        },
      ]}
      fields={fields}
      defaults={{ status: 'published', sections: [] }}
      filters={[{ name: 'status', label: 'All statuses', options: STATUS_OPTIONS }]}
      searchPlaceholder="Search pages…"
      emptyTitle="No pages yet"
      emptyText="Create reusable content pages such as About, Sustainability or Gift Guides."
    />
  );
}

export function BannersModule() {
  const fields = [
    { name: 'kicker', label: 'Kicker / eyebrow' },
    { name: 'title', label: 'Headline', required: true },
    { name: 'subtitle', label: 'Subtitle', type: 'textarea', full: true },
    { name: 'desktopImage', label: 'Desktop image', type: 'image' },
    { name: 'mobileImage', label: 'Mobile image', type: 'image' },
    { name: 'primaryLabel', label: 'Primary button label', required: true },
    { name: 'primaryUrl', label: 'Primary button link', required: true, placeholder: '/products' },
    { name: 'secondaryLabel', label: 'Secondary button label' },
    { name: 'secondaryUrl', label: 'Secondary button link' },
    {
      name: 'accent',
      label: 'Accent',
      type: 'select',
      options: [
        { value: 'gold', label: 'Gold' },
        { value: 'green', label: 'Green' },
        { value: 'cream', label: 'Cream' },
      ],
    },
    { name: 'order', label: 'Slide order', type: 'number', min: 0 },
    { name: 'startDate', label: 'Starts', type: 'date' },
    { name: 'endDate', label: 'Ends', type: 'date' },
    { name: 'active', label: 'Visibility', type: 'checkbox', checkboxLabel: 'Active on the storefront' },
  ];

  return (
    <GenericModule
      eyebrow="Content"
      title="Banners & sliders"
      description="Control homepage hero slides, campaign imagery, calls to action and scheduled visibility."
      endpoint="/api/banners"
      columns={[
        {
          key: 'image',
          label: 'Preview',
          width: 100,
          render: (row) => <Thumb src={row.desktopImage} alt={row.title} wide />,
        },
        {
          key: 'title',
          label: 'Slide',
          render: (row) => (
            <div>
              <div className="strong">{row.title}</div>
              <div className="muted">{row.kicker || '—'}</div>
            </div>
          ),
        },
        {
          key: 'schedule',
          label: 'Schedule',
          render: (row) => (
            <span className="muted">
              {row.startDate ? formatDate(row.startDate) : 'Anytime'} → {row.endDate ? formatDate(row.endDate) : 'Ongoing'}
            </span>
          ),
        },
        { key: 'order', label: 'Order', render: (row) => row.order ?? 0 },
        {
          key: 'active',
          label: 'Status',
          render: (row) => <Badge $tone={row.active ? 'green' : 'neutral'}>{row.active ? 'Active' : 'Inactive'}</Badge>,
        },
      ]}
      fields={fields}
      defaults={{ accent: 'gold', order: 0, active: true }}
      filters={[
        {
          name: 'active',
          label: 'All banners',
          options: [
            { value: 'true', label: 'Active only' },
            { value: 'false', label: 'Inactive only' },
          ],
        },
      ]}
      searchPlaceholder="Search banners…"
      emptyTitle="No banners yet"
      emptyText="Add a hero slide to control the first impression on the homepage."
    />
  );
}

export function BlogsModule() {
  const fields = [
    { name: 'title', label: 'Post title', required: true },
    { name: 'slug', label: 'Slug', hint: 'Auto-generated from the title if blank' },
    { name: 'author', label: 'Author', placeholder: 'RootEco Team' },
    { name: 'category', label: 'Category', placeholder: 'Gifting guides' },
    { name: 'tags', label: 'Tags', type: 'tags', hint: 'Comma separated' },
    { name: 'publishedAt', label: 'Publish date', type: 'date' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: STATUS_OPTIONS,
    },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', full: true },
    { name: 'content', label: 'Article body', type: 'textarea', tall: true, full: true },
    { name: 'image', label: 'Featured image', type: 'image' },
    { name: 'seoTitle', label: 'SEO title' },
    { name: 'seoDescription', label: 'SEO description', type: 'textarea' },
  ];

  return (
    <GenericModule
      eyebrow="Content"
      title="Blogs"
      description="Publish gifting guides, ideas and announcements with SEO metadata and scheduled publishing."
      endpoint="/api/blogs"
      columns={[
        {
          key: 'image',
          label: '',
          width: 54,
          render: (row) => <Thumb src={row.image} alt={row.title} />,
        },
        {
          key: 'title',
          label: 'Post',
          render: (row) => (
            <div>
              <Link href={`/blog/${row.slug}`} target="_blank" rel="noreferrer" className="strong" style={{ color: theme.colors.forest }}>
                {row.title}
              </Link>
              <div className="muted">/{row.slug}</div>
            </div>
          ),
        },
        { key: 'category', label: 'Category', render: (row) => row.category || '—' },
        { key: 'author', label: 'Author', render: (row) => row.author || '—' },
        {
          key: 'publishedAt',
          label: 'Published',
          render: (row) => <span className="muted">{formatDate(row.publishedAt || row.createdAt)}</span>,
        },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
      ]}
      fields={fields}
      defaults={{ status: 'draft', author: 'RootEco Team', tags: [] }}
      filters={[{ name: 'status', label: 'All statuses', options: STATUS_OPTIONS }]}
      searchPlaceholder="Search posts…"
      emptyTitle="No blog posts yet"
    />
  );
}

export function TestimonialsModule() {
  const fields = [
    { name: 'client', label: 'Client name', required: true },
    { name: 'company', label: 'Company' },
    { name: 'designation', label: 'Designation' },
    { name: 'rating', label: 'Rating (1–5)', type: 'number', min: 1, max: 5 },
    { name: 'review', label: 'Review', type: 'textarea', tall: true, full: true, required: true },
    { name: 'image', label: 'Client photo', type: 'image' },
    { name: 'order', label: 'Display order', type: 'number', min: 0 },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: STATUS_OPTIONS,
    },
  ];

  return (
    <GenericModule
      eyebrow="Content"
      title="Testimonials"
      description="Publish client praise on the homepage wall of love and the dedicated testimonial page."
      endpoint="/api/testimonials"
      columns={[
        {
          key: 'client',
          label: 'Client',
          render: (row) => (
            <div>
              <div className="strong">{row.client}</div>
              <div className="muted">
                {[row.designation, row.company].filter(Boolean).join(' · ') || '—'}
              </div>
            </div>
          ),
        },
        {
          key: 'review',
          label: 'Review',
          render: (row) => (
            <span style={{ display: 'block', maxWidth: 380, color: theme.colors.muted }}>
              {row.review.length > 110 ? `${row.review.slice(0, 110)}…` : row.review}
            </span>
          ),
        },
        { key: 'rating', label: 'Rating', render: (row) => `${row.rating} / 5` },
        { key: 'order', label: 'Order', render: (row) => row.order ?? 0 },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
      ]}
      fields={fields}
      defaults={{ rating: 5, status: 'published', order: 0 }}
      filters={[{ name: 'status', label: 'All statuses', options: STATUS_OPTIONS }]}
      searchPlaceholder="Search testimonials…"
      emptyTitle="No testimonials yet"
    />
  );
}

export function FaqsModule() {
  const fields = [
    { name: 'question', label: 'Question', required: true, full: true },
    { name: 'answer', label: 'Answer', type: 'textarea', tall: true, full: true, required: true },
    { name: 'category', label: 'Category', placeholder: 'Orders & delivery' },
    { name: 'order', label: 'Display order', type: 'number', min: 0 },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: STATUS_OPTIONS,
    },
  ];

  return (
    <GenericModule
      eyebrow="Content"
      title="FAQs"
      description="Answer common questions on the FAQ page, product pages and footer help links."
      endpoint="/api/faqs"
      columns={[
        {
          key: 'question',
          label: 'Question',
          render: (row) => <span className="strong">{row.question}</span>,
        },
        { key: 'category', label: 'Category', render: (row) => row.category || '—' },
        {
          key: 'answer',
          label: 'Answer',
          render: (row) => (
            <span style={{ display: 'block', maxWidth: 420, color: theme.colors.muted }}>
              {row.answer.length > 120 ? `${row.answer.slice(0, 120)}…` : row.answer}
            </span>
          ),
        },
        { key: 'order', label: 'Order', render: (row) => row.order ?? 0 },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
      ]}
      fields={fields}
      defaults={{ status: 'published', order: 0 }}
      filters={[{ name: 'status', label: 'All statuses', options: STATUS_OPTIONS }]}
      searchPlaceholder="Search FAQs…"
      emptyTitle="No FAQs yet"
    />
  );
}
