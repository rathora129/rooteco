/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo } from 'react';
import GenericModule from '@/components/dashboard/GenericModule';
import { StatusBadge, Badge } from '@/components/dashboard/ui';
import { formatDate, formatMoney, useList } from '@/components/dashboard/hooks';

function Thumb({ src, alt, size = 40 }) {
  return src ? (
    <img
      src={src}
      alt={alt || ''}
      style={{ width: size, height: size, borderRadius: 8, objectFit: 'cover', border: '1px solid #E3DCCB' }}
    />
  ) : (
    <span
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: size,
        height: size,
        borderRadius: 8,
        background: '#F6F1E7',
        color: '#5C6B62',
        fontSize: 10,
      }}
    >
      No img
    </span>
  );
}

export function ProductsModule() {
  const { data: categories } = useList('/api/categories', { pageSize: 100, sort: 'name', order: 'asc' });
  const { data: collections } = useList('/api/collections', { pageSize: 100, sort: 'name', order: 'asc' });

  const categoryOptions = useMemo(
    () => categories.filter((category) => !category.parentId).map((category) => ({ value: category.id, label: category.name })),
    [categories]
  );
  const subcategoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.parentId)
        .map((category) => ({
          value: category.id,
          label: `${category.name}${category.parent ? ` · ${category.parent.name}` : ''}`,
        })),
    [categories]
  );
  const collectionOptions = useMemo(
    () => collections.map((collection) => ({ value: collection.id, label: collection.name })),
    [collections]
  );

  const fields = [
    { name: 'name', label: 'Product name', required: true, placeholder: 'Signature Welcome Kit' },
    { name: 'slug', label: 'Slug', hint: 'Auto-generated if blank' },
    { name: 'sku', label: 'SKU', hint: 'Auto-generated if blank' },
    { name: 'categoryId', label: 'Category', type: 'select', required: true, options: categoryOptions },
    { name: 'subcategoryId', label: 'Subcategory', type: 'select', options: subcategoryOptions },
    { name: 'type', label: 'Type / collection label', placeholder: 'Welcome kit' },
    { name: 'price', label: 'Price (₹)', type: 'number', required: true, min: 0 },
    { name: 'salePrice', label: 'Discounted price (₹)', type: 'number', min: 0, hint: 'Optional' },
    { name: 'stock', label: 'Stock quantity', type: 'number', min: 0 },
    {
      name: 'stockStatus',
      label: 'Stock status',
      type: 'select',
      options: [
        { value: 'in', label: 'In stock' },
        { value: 'low', label: 'Low stock' },
        { value: 'out', label: 'Out of stock' },
      ],
    },
    { name: 'shortDescription', label: 'Short description', type: 'textarea' },
    { name: 'description', label: 'Long description', type: 'textarea', tall: true, full: true },
    { name: 'images', label: 'Product gallery', type: 'imagelist' },
    { name: 'colors', label: 'Colours', type: 'tags', hint: 'Comma separated' },
    { name: 'variants', label: 'Variants', type: 'tags', hint: 'Comma separated' },
    { name: 'customization', label: 'Customization options', type: 'tags', hint: 'Comma separated' },
    { name: 'occasions', label: 'Occasions', type: 'tags', hint: 'Comma separated' },
    { name: 'badge', label: 'Badge', placeholder: 'Best seller' },
    { name: 'rating', label: 'Rating', type: 'number', min: 0, max: 5, step: '0.1' },
    { name: 'reviewsCount', label: 'Reviews count', type: 'number', min: 0 },
    {
      name: 'specifications',
      label: 'Specifications (JSON)',
      type: 'json',
      hint: 'Object or array of key/value pairs',
    },
    { name: 'collectionIds', label: 'Collections', type: 'multiselect', options: collectionOptions, full: true },
    { name: 'bestSeller', label: 'Best seller', type: 'checkbox', checkboxLabel: 'Show in best sellers' },
    { name: 'featured', label: 'Featured', type: 'checkbox', checkboxLabel: 'Feature on homepage' },
    { name: 'newArrival', label: 'New arrival', type: 'checkbox', checkboxLabel: 'Mark as new arrival' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
      ],
    },
    { name: 'seoTitle', label: 'SEO title' },
    { name: 'seoDescription', label: 'SEO description', type: 'textarea' },
  ];

  return (
    <GenericModule
      eyebrow="Catalogue"
      title="Products"
      description="Manage every gift in the catalogue — pricing, stock, imagery, collections and storefront visibility."
      endpoint="/api/products"
      columns={[
        {
          key: 'image',
          label: '',
          width: 54,
          render: (row) => <Thumb src={row.images?.[0]} alt={row.name} />,
        },
        {
          key: 'name',
          label: 'Product',
          render: (row) => (
            <div>
              <div className="strong">{row.name}</div>
              <div className="muted">{row.sku || '—'}</div>
            </div>
          ),
        },
        {
          key: 'category',
          label: 'Category',
          render: (row) => (
            <div>
              <div>{row.category?.name || '—'}</div>
              {row.subcategory && <div className="muted">{row.subcategory.name}</div>}
            </div>
          ),
        },
        {
          key: 'price',
          label: 'Price',
          render: (row) =>
            row.salePrice ? (
              <div>
                <div className="strong">{formatMoney(row.salePrice)}</div>
                <div className="muted" style={{ textDecoration: 'line-through' }}>
                  {formatMoney(row.price)}
                </div>
              </div>
            ) : (
              <span className="strong">{formatMoney(row.price)}</span>
            ),
        },
        {
          key: 'stock',
          label: 'Stock',
          render: (row) => (
            <div>
              <StatusBadge value={row.stockStatus} />
              <div className="muted">{row.stock} units</div>
            </div>
          ),
        },
        {
          key: 'flags',
          label: 'Flags',
          render: (row) => (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {row.featured && <Badge $tone="gold">Featured</Badge>}
              {row.bestSeller && <Badge $tone="green">Best seller</Badge>}
              {row.newArrival && <Badge $tone="blue">New</Badge>}
            </div>
          ),
        },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        {
          key: 'createdAt',
          label: 'Added',
          render: (row) => <span className="muted">{formatDate(row.createdAt)}</span>,
        },
      ]}
      fields={fields}
      defaults={{
        status: 'published',
        stockStatus: 'in',
        stock: 0,
        price: 0,
        rating: 4.8,
        reviewsCount: 0,
        images: [],
        colors: [],
        variants: [],
        customization: [],
        occasions: [],
        collectionIds: [],
        bestSeller: false,
        featured: false,
        newArrival: false,
      }}
      filters={[
        {
          name: 'status',
          label: 'All statuses',
          options: [
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
          ],
        },
        { name: 'categoryId', label: 'All categories', options: categoryOptions },
        {
          name: 'featured',
          label: 'Featured',
          options: [
            { value: 'true', label: 'Featured only' },
            { value: 'false', label: 'Not featured' },
          ],
        },
      ]}
      searchPlaceholder="Search products, SKU…"
      defaultSort={[
        { value: 'newest', label: 'Newest first' },
        { value: 'price-low', label: 'Price low to high' },
        { value: 'price-high', label: 'Price high to low' },
        { value: 'rating', label: 'Highest rated' },
      ]}
      transformIn={(row) => ({ ...row, collectionIds: (row.collections || []).map((item) => item.id) })}
      emptyTitle="No products yet"
      emptyText="Add your first product to start selling on the storefront."
    />
  );
}

export function CategoriesModule() {
  const { data: categories } = useList('/api/categories', { pageSize: 100, sort: 'name', order: 'asc' });
  const parentOptions = useMemo(
    () => categories.filter((category) => !category.parentId).map((category) => ({ value: category.id, label: category.name })),
    [categories]
  );

  const fields = [
    { name: 'name', label: 'Category name', required: true },
    { name: 'slug', label: 'Slug', hint: 'Auto-generated if blank' },
    { name: 'tagline', label: 'Tagline' },
    { name: 'parentId', label: 'Parent category', type: 'select', options: parentOptions, hint: 'Leave blank for a top-level category' },
    { name: 'order', label: 'Display order', type: 'number', min: 0 },
    { name: 'description', label: 'Description', type: 'textarea', tall: true, full: true },
    { name: 'image', label: 'Category image', type: 'image' },
    { name: 'homeCard', label: 'Homepage card', type: 'checkbox', checkboxLabel: 'Show on homepage' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
      ],
    },
    { name: 'seoTitle', label: 'SEO title' },
    { name: 'seoDescription', label: 'SEO description', type: 'textarea' },
  ];

  return (
    <GenericModule
      eyebrow="Catalogue"
      title="Categories"
      description="Organise the catalogue into categories and subcategories used by the mega menu and storefront listings."
      endpoint="/api/categories"
      columns={[
        {
          key: 'image',
          label: '',
          width: 54,
          render: (row) => <Thumb src={row.image} alt={row.name} />,
        },
        {
          key: 'name',
          label: 'Category',
          render: (row) => (
            <div>
              <div className="strong">{row.name}</div>
              {row.parent && <div className="muted">Inside {row.parent.name}</div>}
            </div>
          ),
        },
        { key: 'tagline', label: 'Tagline', render: (row) => <span className="muted">{row.tagline || '—'}</span> },
        {
          key: 'products',
          label: 'Products',
          render: (row) => <span>{row._count?.products ?? 0}</span>,
        },
        { key: 'homeCard', label: 'Homepage', render: (row) => (row.homeCard ? <Badge $tone="green">Shown</Badge> : '—') },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        { key: 'order', label: 'Order', render: (row) => row.order ?? 0 },
      ]}
      fields={fields}
      defaults={{ status: 'published', order: 0, homeCard: false }}
      filters={[
        {
          name: 'status',
          label: 'All statuses',
          options: [
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
          ],
        },
        { name: 'parentId', label: 'All levels', options: [{ value: 'null', label: 'Top level only' }] },
      ]}
      searchPlaceholder="Search categories…"
      emptyTitle="No categories yet"
    />
  );
}

export function CollectionsModule() {
  const { data: products } = useList('/api/products', { pageSize: 100, sort: 'name', order: 'asc' });
  const productOptions = useMemo(
    () => products.map((product) => ({ value: product.id, label: product.name })),
    [products]
  );

  const fields = [
    { name: 'name', label: 'Collection name', required: true },
    { name: 'slug', label: 'Slug', hint: 'Auto-generated if blank' },
    { name: 'order', label: 'Display order', type: 'number', min: 0 },
    { name: 'description', label: 'Description', type: 'textarea', tall: true, full: true },
    { name: 'image', label: 'Collection image', type: 'image' },
    { name: 'productIds', label: 'Products in this collection', type: 'multiselect', options: productOptions, full: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
      ],
    },
    { name: 'seoTitle', label: 'SEO title' },
    { name: 'seoDescription', label: 'SEO description', type: 'textarea' },
  ];

  return (
    <GenericModule
      eyebrow="Catalogue"
      title="Collections"
      description="Curate seasonal edits, festival sets and gift guides from products already in the catalogue."
      endpoint="/api/collections"
      columns={[
        {
          key: 'image',
          label: '',
          width: 54,
          render: (row) => <Thumb src={row.image} alt={row.name} />,
        },
        { key: 'name', label: 'Collection', render: (row) => <span className="strong">{row.name}</span> },
        {
          key: 'products',
          label: 'Products',
          render: (row) => <span>{row._count?.products ?? row.products?.length ?? 0}</span>,
        },
        { key: 'order', label: 'Order', render: (row) => row.order ?? 0 },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        {
          key: 'updatedAt',
          label: 'Updated',
          render: (row) => <span className="muted">{formatDate(row.updatedAt)}</span>,
        },
      ]}
      fields={fields}
      defaults={{ status: 'published', order: 0, productIds: [] }}
      filters={[
        {
          name: 'status',
          label: 'All statuses',
          options: [
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
          ],
        },
      ]}
      searchPlaceholder="Search collections…"
      transformIn={(row) => ({ ...row, productIds: (row.products || []).map((item) => item.id) })}
      emptyTitle="No collections yet"
    />
  );
}
