/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Boxes, FolderTree, Layers } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  ImageField,
  StatusBadge,
} from '@/components/dashboard/ui';
import Workspace, { DetailList, DetailRow, DetailSection } from '@/components/dashboard/Workspace';
import { apiRequest, formatDate, formatMoney } from '@/components/dashboard/hooks';

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
        {sub && <div style={{ color: 'var(--dash-faint)', fontSize: 10.5 }}>{sub}</div>}
      </div>
    </div>
  );
}

function useCatalogOptions() {
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest('/api/categories?pageSize=100'),
      apiRequest('/api/collections?pageSize=100'),
      apiRequest('/api/products?pageSize=100'),
    ])
      .then(([categoryPayload, collectionPayload, productPayload]) => {
        if (!active) return;
        setCategories(categoryPayload.data || []);
        setCollections(collectionPayload.data || []);
        setProducts(productPayload.data || []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  return { categories, collections, products, error };
}

export function ProductsModule() {
  const { categories, collections, error } = useCatalogOptions();
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories]
  );
  const collectionOptions = useMemo(
    () => collections.map((collection) => ({ value: collection.id, label: collection.name })),
    [collections]
  );

  const fields = [
    { name: 'name', label: 'Product name', required: true, section: 'Overview', full: true, placeholder: 'Signature Diwali Gift Box' },
    { name: 'sku', label: 'SKU', hint: 'Auto-generated when blank', placeholder: 'RE-DIWALI-01' },
    { name: 'categoryId', label: 'Category', type: 'select', required: true, options: categoryOptions },
    { name: 'subcategoryId', label: 'Subcategory', type: 'select', options: categoryOptions, placeholder: 'Optional' },
    { name: 'type', label: 'Product type', placeholder: 'Hamper' },
    { name: 'status', label: 'Publish status', type: 'select', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }], required: true },
    { name: 'price', label: 'Price (₹)', type: 'number', required: true, min: 0, step: '0.01', section: 'Pricing & inventory' },
    { name: 'salePrice', label: 'Sale price (₹)', type: 'number', min: 0, step: '0.01', hint: 'Leave blank for no discount' },
    { name: 'stock', label: 'Stock quantity', type: 'number', min: 0, step: 1 },
    { name: 'stockStatus', label: 'Stock status', type: 'select', options: [{ value: 'in', label: 'In stock' }, { value: 'low', label: 'Low stock' }, { value: 'out', label: 'Out of stock' }] },
    { name: 'shortDescription', label: 'Short description', type: 'textarea', section: 'Content', full: true, placeholder: 'One or two lines shown on product cards.' },
    { name: 'description', label: 'Full description', type: 'textarea', full: true, $tall: true },
    { name: 'images', label: 'Product images', type: 'imagelist' },
    { name: 'colors', label: 'Colour options', type: 'tags', placeholder: 'Forest green, Ivory, Gold' },
    { name: 'occasions', label: 'Occasions', type: 'tags', placeholder: 'Diwali, Onboarding, Thank you' },
    { name: 'customization', label: 'Customisation options', type: 'tags', placeholder: 'Logo embossing, Custom sleeve' },
    { name: 'badge', label: 'Badge', placeholder: 'Bestseller' },
    { name: 'collectionIds', label: 'Collections', type: 'multiselect', options: collectionOptions, section: 'Merchandising' },
    { name: 'featured', label: 'Featured', type: 'checkbox', checkboxLabel: 'Show on featured sections' },
    { name: 'bestSeller', label: 'Best seller', type: 'checkbox', checkboxLabel: 'Mark as best seller' },
    { name: 'newArrival', label: 'New arrival', type: 'checkbox', checkboxLabel: 'Mark as new arrival' },
    { name: 'seoTitle', label: 'SEO title', section: 'Search & sharing', full: true },
    { name: 'seoDescription', label: 'SEO description', type: 'textarea', full: true },
  ];

  const columns = [
    {
      key: 'name',
      label: 'Product',
      width: 280,
      render: (row) => <NameCell image={row.images?.[0]} name={row.name} sub={row.sku || row.slug} />,
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <div>
          <div>{row.category?.name || '—'}</div>
          {row.subcategory?.name && <div className="muted">{row.subcategory.name}</div>}
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => (
        <div>
          <div className="strong mono">{formatMoney(row.salePrice || row.price)}</div>
          {row.salePrice && Number(row.salePrice) < Number(row.price) && (
            <div className="muted" style={{ textDecoration: 'line-through' }}>{formatMoney(row.price)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (row) => (
        <Badge $tone={Number(row.stock) <= 0 ? 'red' : Number(row.stock) <= 5 ? 'gold' : 'green'}>
          {Number(row.stock) <= 0 ? 'Out of stock' : `${row.stock} units`}
        </Badge>
      ),
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    {
      key: 'collections',
      label: 'Collections',
      render: (row) => (row.collections?.length ? row.collections.map((collection) => collection.name).join(', ') : '—'),
    },
  ];

  function renderDetail(row) {
    return (
      <>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          {row.images?.length ? (
            row.images.slice(0, 3).map((image) => (
              <span
                key={image}
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 10,
                  background: `#fff url(${image}) center / cover no-repeat`,
                  border: '1px solid var(--dash-line)',
                }}
              />
            ))
          ) : (
            <EmptyState title="No images" text="Add product imagery for the storefront." />
          )}
        </div>
        <DetailSection title="Product">
          <DetailList>
            <DetailRow label="Name">{row.name}</DetailRow>
            <DetailRow label="SKU">{row.sku}</DetailRow>
            <DetailRow label="Slug">{row.slug}</DetailRow>
            <DetailRow label="Status"><StatusBadge value={row.status} /></DetailRow>
            <DetailRow label="Category">{row.category?.name || '—'}</DetailRow>
            <DetailRow label="Subcategory">{row.subcategory?.name || '—'}</DetailRow>
            <DetailRow label="Collections">
              {row.collections?.length ? row.collections.map((collection) => collection.name).join(', ') : '—'}
            </DetailRow>
          </DetailList>
        </DetailSection>
        <DetailSection title="Pricing & stock">
          <DetailList>
            <DetailRow label="Price">{formatMoney(row.price)}</DetailRow>
            <DetailRow label="Sale price">{row.salePrice ? formatMoney(row.salePrice) : '—'}</DetailRow>
            <DetailRow label="Stock">{row.stock} units</DetailRow>
            <DetailRow label="Stock status"><StatusBadge value={row.stockStatus} /></DetailRow>
            <DetailRow label="Created">{formatDate(row.createdAt)}</DetailRow>
          </DetailList>
        </DetailSection>
        {row.shortDescription && (
          <DetailSection title="Short description">
            <p style={{ fontSize: 12.5, color: 'var(--dash-muted)', lineHeight: 1.65 }}>{row.shortDescription}</p>
          </DetailSection>
        )}
        {row.description && (
          <DetailSection title="Description">
            <p style={{ fontSize: 12.5, color: 'var(--dash-muted)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{row.description}</p>
          </DetailSection>
        )}
        <DetailSection title="Merchandising">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge $tone={row.featured ? 'gold' : 'neutral'}>Featured</Badge>
            <Badge $tone={row.bestSeller ? 'green' : 'neutral'}>Best seller</Badge>
            <Badge $tone={row.newArrival ? 'blue' : 'neutral'}>New arrival</Badge>
          </div>
        </DetailSection>
        {(row.colors?.length > 0 || row.occasions?.length > 0 || row.customization?.length > 0) && (
          <DetailSection title="Options">
            <DetailList>
              <DetailRow label="Colours">{row.colors?.join(', ') || '—'}</DetailRow>
              <DetailRow label="Occasions">{row.occasions?.join(', ') || '—'}</DetailRow>
              <DetailRow label="Customisation">{row.customization?.join(', ') || '—'}</DetailRow>
            </DetailList>
          </DetailSection>
        )}
      </>
    );
  }

  return (
    <>
      {error && <ErrorBlock message={error} />}
      <Workspace
        eyebrow="Catalogue"
        title="Products"
        description="Manage the physical catalogue — pricing, stock, imagery and merchandising for the live storefront."
        endpoint="/api/products"
        itemLabel="product"
        columns={columns}
        fields={fields}
        defaults={{ status: 'published', stock: 0, images: [], colors: [], occasions: [], customization: [], featured: false, bestSeller: false, newArrival: false }}
        filters={[
          { name: 'status', label: 'All statuses', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }] },
          { name: 'featured', label: 'Featured', options: [{ value: 'true', label: 'Featured only' }, { value: 'false', label: 'Not featured' }] },
          { name: 'categoryId', label: 'All categories', options: categoryOptions },
        ]}
        sortOptions={[
          { value: 'newest', label: 'Newest first', sort: 'newest' },
          { value: 'price-low', label: 'Price: low to high', sort: 'price-low' },
          { value: 'price-high', label: 'Price: high to low', sort: 'price-high' },
          { value: 'best-selling', label: 'Best selling', sort: 'best-selling' },
        ]}
        searchPlaceholder="Search by name, SKU or description…"
        createLabel="Add product"
        itemLabelPlural="products"
        emptyTitle="No products found"
        emptyText="Create your first product or adjust the filters."
        emptyIcon={<Boxes size={19} />}
        renderDetail={renderDetail}
        liveHref={(row) => `/products/${row.slug}`}
        exportName="products"
        viewModes={['table', 'grid']}
        renderCard={(row) => (
          <>
            <span
              style={{
                display: 'block',
                height: 132,
                background: row.images?.[0] ? `#fff url(${row.images[0]}) center / cover no-repeat` : 'var(--dash-panel-2)',
              }}
            />
            <span style={{ display: 'block', padding: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 12.5, color: 'var(--dash-ink)', fontWeight: 600 }}>{row.name}</strong>
                <StatusBadge value={row.status} />
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7, fontSize: 12 }}>
                <span style={{ color: 'var(--dash-accent)', fontWeight: 650 }}>{formatMoney(row.salePrice || row.price)}</span>
                <span style={{ color: 'var(--dash-faint)', marginLeft: 'auto' }}>{row.stock} in stock</span>
              </span>
            </span>
          </>
        )}
        validate={(values) => (!values.categoryId ? 'Choose a category for this product.' : '')}
      />
    </>
  );
}

export function CategoriesModule() {
  const { categories } = useCatalogOptions();
  const parentOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories]
  );

  const fields = [
    { name: 'name', label: 'Category name', required: true, section: 'Overview', placeholder: 'Festive gifting' },
    { name: 'slug', label: 'URL slug', hint: 'Auto-generated when blank', placeholder: 'festive-gifting' },
    { name: 'tagline', label: 'Tagline', full: true, placeholder: 'Thoughtful hampers for every celebration' },
    { name: 'description', label: 'Description', type: 'textarea', full: true },
    { name: 'image', label: 'Category image', type: 'image', section: 'Media' },
    { name: 'parentId', label: 'Parent category', type: 'select', options: parentOptions, placeholder: 'Top-level category', section: 'Placement' },
    { name: 'order', label: 'Sort order', type: 'number', min: 0 },
    { name: 'homeCard', label: 'Home card', type: 'checkbox', checkboxLabel: 'Feature on the homepage' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }] },
    { name: 'seoTitle', label: 'SEO title', section: 'Search & sharing', full: true },
    { name: 'seoDescription', label: 'SEO description', type: 'textarea', full: true },
  ];

  const columns = [
    { key: 'name', label: 'Category', width: 280, render: (row) => <NameCell image={row.image} name={row.name} sub={row.tagline} /> },
    { key: 'parent', label: 'Parent', render: (row) => row.parent?.name || 'Top level' },
    { key: 'products', label: 'Products', render: (row) => <Badge $tone="neutral">{row._count?.products ?? 0}</Badge> },
    { key: 'homeCard', label: 'Home card', render: (row) => (row.homeCard ? <Badge $tone="gold">Featured</Badge> : '—') },
    { key: 'order', label: 'Order' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
  ];

  return (
    <Workspace
      eyebrow="Catalogue"
      title="Categories"
      description="Structure the catalogue into shoppable categories and subcategories, with imagery and merchandising order."
      endpoint="/api/categories"
      itemLabel="category"
      columns={columns}
      fields={fields}
      defaults={{ status: 'published', homeCard: false, order: 0 }}
      filters={[{ name: 'status', label: 'All statuses', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }] }]}
      sortOptions={[
        { value: 'order', label: 'Display order', sort: 'order', order: 'asc' },
        { value: 'name', label: 'Name A–Z', sort: 'name', order: 'asc' },
        { value: 'newest', label: 'Newest first', sort: 'createdAt', order: 'desc' },
      ]}
      searchPlaceholder="Search categories…"
      createLabel="Add category"
      itemLabelPlural="categories"
      emptyTitle="No categories yet"
      emptyText="Create a category to organise products on the storefront."
      emptyIcon={<FolderTree size={19} />}
      liveHref={(row) => `/categories/${row.slug}`}
      renderDetail={(row) => (
        <>
          {row.image && (
            <div style={{ height: 150, borderRadius: 10, marginBottom: 18, background: `#fff url(${row.image}) center / cover no-repeat`, border: '1px solid var(--dash-line)' }} />
          )}
          <DetailSection title="Category">
            <DetailList>
              <DetailRow label="Name">{row.name}</DetailRow>
              <DetailRow label="Slug">{row.slug}</DetailRow>
              <DetailRow label="Parent">{row.parent?.name || 'Top level'}</DetailRow>
              <DetailRow label="Status"><StatusBadge value={row.status} /></DetailRow>
              <DetailRow label="Products">{row._count?.products ?? 0}</DetailRow>
              <DetailRow label="Subcategories">
                {row.children?.length ? row.children.map((child) => child.name).join(', ') : '—'}
              </DetailRow>
            </DetailList>
          </DetailSection>
          {row.tagline && <DetailSection title="Tagline"><p style={{ fontSize: 12.5, color: 'var(--dash-muted)' }}>{row.tagline}</p></DetailSection>}
          {row.description && <DetailSection title="Description"><p style={{ fontSize: 12.5, color: 'var(--dash-muted)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{row.description}</p></DetailSection>}
        </>
      )}
      exportName="categories"
    />
  );
}

export function CollectionsModule() {
  const { products } = useCatalogOptions();
  const productOptions = useMemo(
    () => products.map((product) => ({ value: product.id, label: product.name })),
    [products]
  );

  const fields = [
    { name: 'name', label: 'Collection name', required: true, section: 'Overview', placeholder: 'The Diwali Edit' },
    { name: 'slug', label: 'URL slug', hint: 'Auto-generated when blank' },
    { name: 'description', label: 'Description', type: 'textarea', full: true },
    { name: 'image', label: 'Cover image', type: 'image', section: 'Media' },
    { name: 'productIds', label: 'Products in this collection', type: 'multiselect', options: productOptions, section: 'Products' },
    { name: 'order', label: 'Sort order', type: 'number', min: 0, section: 'Placement' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }] },
    { name: 'seoTitle', label: 'SEO title', section: 'Search & sharing', full: true },
    { name: 'seoDescription', label: 'SEO description', type: 'textarea', full: true },
  ];

  const columns = [
    { key: 'name', label: 'Collection', width: 300, render: (row) => <NameCell image={row.image} name={row.name} sub={`${row._count?.products ?? 0} products`} /> },
    {
      key: 'preview',
      label: 'Preview',
      render: (row) => (row.products?.length ? row.products.slice(0, 4).map((product) => <Thumb key={product.id} src={product.images?.[0]} label={product.name} size={28} />) : '—'),
    },
    { key: 'order', label: 'Order' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <Workspace
      eyebrow="Catalogue"
      title="Collections"
      description="Curated edits that cut across categories — seasonal drops, gifting guides and campaign landing collections."
      endpoint="/api/collections"
      itemLabel="collection"
      columns={columns}
      fields={fields}
      defaults={{ status: 'published', order: 0, productIds: [] }}
      filters={[{ name: 'status', label: 'All statuses', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }] }]}
      sortOptions={[
        { value: 'order', label: 'Display order', sort: 'order', order: 'asc' },
        { value: 'name', label: 'Name A–Z', sort: 'name', order: 'asc' },
        { value: 'newest', label: 'Newest first', sort: 'createdAt', order: 'desc' },
      ]}
      searchPlaceholder="Search collections…"
      createLabel="Add collection"
      itemLabelPlural="collections"
      emptyTitle="No collections yet"
      emptyText="Create a curated edit to merchandise products together."
      emptyIcon={<Layers size={19} />}
      liveHref={(row) => `/collections/${row.slug}`}
      renderDetail={(row) => (
        <>
          {row.image && (
            <div style={{ height: 150, borderRadius: 10, marginBottom: 18, background: `#fff url(${row.image}) center / cover no-repeat`, border: '1px solid var(--dash-line)' }} />
          )}
          <DetailSection title="Collection">
            <DetailList>
              <DetailRow label="Name">{row.name}</DetailRow>
              <DetailRow label="Slug">{row.slug}</DetailRow>
              <DetailRow label="Status"><StatusBadge value={row.status} /></DetailRow>
              <DetailRow label="Products">{row._count?.products ?? 0}</DetailRow>
              <DetailRow label="Order">{row.order}</DetailRow>
            </DetailList>
          </DetailSection>
          {row.description && <DetailSection title="Description"><p style={{ fontSize: 12.5, color: 'var(--dash-muted)', lineHeight: 1.65 }}>{row.description}</p></DetailSection>}
          <DetailSection title="Products">
            {(row.products || []).length === 0 ? (
              <EmptyState title="No products" text="Add products to this collection." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {row.products.map((product) => (
                  <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Thumb src={product.images?.[0]} label={product.name} size={28} />
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--dash-ink)' }}>{product.name}</span>
                    <StatusBadge value={product.status} />
                  </div>
                ))}
              </div>
            )}
          </DetailSection>
        </>
      )}
      exportName="collections"
    />
  );
}
