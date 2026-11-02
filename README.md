# RootEco — Corporate Gifting Storefront & Owner Dashboard

A complete full-stack corporate-gifting website built with Next.js App Router, PostgreSQL and Prisma. The public storefront, checkout, CRM and the owner dashboard all read from the same database, so every change made in the dashboard is reflected on the website.

## Stack

- **Framework:** Next.js 16 (App Router, JavaScript)
- **UI:** React 19, styled-components, framer-motion, lucide-react
- **Database:** PostgreSQL + Prisma 6
- **Validation:** Zod
- **Auth:** single-owner email/password with scrypt hashes and database-backed sessions
- **Media:** Cloudinary, Supabase Storage, or local uploads for development only
- **Payments:** Razorpay integration structure (online payments disabled until configured)
- **Messaging:** WhatsApp Cloud API integration structure (click-to-chat fallback)
- **Deployment:** Vercel

## Features

### Public storefront

- Database-driven homepage: banners, categories, collections, featured/new/best-selling products, testimonials and FAQs
- Product catalogue with category/subcategory navigation, search, filters, sorting, grid/list views and pagination
- Product detail pages with galleries, variants, customization, specifications, related products and SEO metadata
- Collections and Journal (blog) pages
- CMS-driven custom pages at `/pages/[slug]`
- Cart, coupon support, checkout and order confirmation
- Server-priced orders, coupon validation, shipping calculation and order history
- Quote request flow, contact form, newsletter signup and order tracking
- Build-your-own-hamper flow
- WhatsApp click-to-chat button and enquiry tracking
- Responsive premium design matching the RootEco brand

### Owner dashboard (`/dashboard`)

Single-owner login at `/login`. There is no public registration.

| Module | Capabilities |
| --- | --- |
| Overview | Counts, revenue, 14-day chart, lead pipeline, recent orders/quotes/leads and top products |
| Website Pages | CMS pages with ordered text/image/quote/columns/CTA sections, SEO and draft/published status |
| Products | Full CRUD, pricing, stock, colours, variants, images, collections, customization and SEO |
| Categories | Tree categories/subcategories with imagery, ordering and SEO |
| Collections | Curated collection CRUD with product assignment |
| Banners & Sliders | Scheduled homepage hero slides |
| Media Library | Upload, list, delete and reuse media assets |
| Blogs | Journal CRUD with publishing dates, tags and SEO |
| Orders | Search/filter, detail timeline, fulfilment status updates and protected payment status |
| Quotes | Pipeline, follow-ups, internal notes, amount/quantity and conversion to an order |
| Leads & Clients | CRM lists, lead assignment fields, follow-ups, export and conversion to clients |
| WhatsApp | Provider status, message sending when configured, and real message history |
| Marketing & SEO | Traffic stats, event breakdown, coupons, SEO defaults, tracking IDs and sitemap/robots links |
| Testimonials | Publish and order customer stories |
| FAQs | Publish and order help content |
| Settings | General, contact, social, footer, SEO, marketing, payments and WhatsApp settings |

All dashboard APIs require an authenticated owner session.

> The built-in Home, About and Contact routes keep their bespoke themed layouts. Their database page records drive SEO metadata, and any new page created in Website Pages renders fully through the CMS renderer at `/pages/[slug]`.

## Project Structure

```
prisma/
  schema.prisma          Database models
  migrations/            Applied SQL migrations
  seed.js                Demo catalogue, content and owner seed
src/
  app/
    (site)/              Public storefront routes
    dashboard/           Owner dashboard routes
    api/                 REST API route handlers
    sitemap.js           Database-driven sitemap
    robots.js            robots.txt
  components/
    dashboard/           Dashboard shell, modules and UI primitives
    catalog/ products/  Storefront catalogue UI
    cart/ forms/        Checkout, quote, contact and order UI
    layout/ marketing/  Navbar, footer, cart drawer and analytics
    pages/              About, contact, blog, collection and CMS renderers
  lib/
    api/                 API envelope, validation resources and helpers
    auth.js              Owner sessions and password hashing
    catalog.js           Public storefront queries and mappers
    orders.js            Server-side order creation and pricing
    payments.js          Razorpay provider helpers
    settings.js          Settings merge and public filtering
    seo.js               Canonical URL and JSON-LD helpers
    storage.js           Cloudinary/Supabase/local media drivers
    store.jsx            Cart and wishlist state
    whatsapp.js          WhatsApp Cloud API helpers
  data/                  Brand, navigation and fallback content
```

## Local Setup

### 1. Prerequisites

- Node.js 20+
- PostgreSQL 14+

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in the values. At minimum:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/rooteco?schema=public"
SITE_URL="http://localhost:3000"
OWNER_EMAIL="owner@rooteco.in"
OWNER_NAME="RootEco Owner"
OWNER_PASSWORD="choose-a-strong-password"
```

### 4. Create the database schema and seed data

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

`db:seed` creates the owner account from `OWNER_EMAIL` / `OWNER_PASSWORD`, plus the demo catalogue, pages, collections, blogs, FAQs, testimonials and settings. Existing records are seeded with idempotent upserts; review the seed before running it against a database with real data.

### 5. Run the app

```bash
npm run dev
```

- Storefront: `http://localhost:3000`
- Owner login: `http://localhost:3000/login`
- Use `OWNER_EMAIL` and `OWNER_PASSWORD` from `.env`.
- Dashboard: `http://localhost:3000/dashboard`

## Environment Variables

See `.env.example` for the complete list.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `SITE_URL` | Canonical public site URL used for SEO/sitemap |
| `OWNER_EMAIL`, `OWNER_NAME`, `OWNER_PASSWORD` | Initial owner account, read only by the seed |
| `MEDIA_DRIVER` | `cloudinary`, `supabase` or blank for local dev uploads |
| `CLOUDINARY_*` | Cloudinary credentials and folder |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` | Supabase Storage credentials |
| `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET` | WhatsApp Cloud API |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Razorpay online payments |
| `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID` | Analytics fallbacks (dashboard values take precedence) |

Never expose server secrets (`RAZORPAY_KEY_SECRET`, Cloudinary secret, service-role key, WhatsApp token) to the browser.

## Owner Authentication & Security

- Single owner only; no signup route.
- Passwords hashed with scrypt and a per-user salt.
- Sessions stored in the database; only a SHA-256 token hash is persisted.
- Session token is sent in an `httpOnly`, `sameSite=lax` cookie; `secure` in production.
- Dashboard layout and admin APIs validate the session server-side.
- Sessions expire automatically and can be revoked by logout.
- Login and public write endpoints are rate-limited.
- Manual API/UI changes cannot set an order to `paid`; paid status is only set by a verified payment-provider response.

## Orders & Payments

Order totals are calculated server-side from current product prices; the client cannot submit prices. Shipping is ₹150 below ₹2,000 and free at or above ₹2,000. Coupons are validated server-side.

### Razorpay structure

The following endpoints exist:

- `GET /api/payments/config` — public, returns whether online payment is enabled and the publishable key ID only when configured.
- `POST /api/payments/create` — creates a Razorpay order for an existing storefront order without marking it paid.
- `POST /api/payments/verify` — verifies the Razorpay checkout signature and only then marks the order paid.
- `POST /api/payments/webhook` — verifies `x-razorpay-signature` and confirms captured payments.

Online payment is available only when **all** of the following are true:

1. `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set.
2. `RAZORPAY_WEBHOOK_SECRET` is set for webhook confirmation.
3. Online payments are enabled in Dashboard → Settings → Payments.

If these are not configured, the checkout offers bank transfer and cash on delivery only. No payment is fabricated, and no order is marked paid without a verified provider signature. Configure the Razorpay webhook URL as `https://your-domain.com/api/payments/webhook`.

## WhatsApp

- The floating button uses the number in Settings → WhatsApp.
- The dashboard WhatsApp module reports provider configuration status and allows sending only when server credentials are present.
- Outbound messages go through WhatsApp Cloud API; inbound messages sync through `/api/whatsapp/webhook`.
- Message history is real database data. No conversations or API responses are fabricated.
- If the Cloud API is not configured, sending is disabled and the UI explains what is missing.
- The seeded number is a demo placeholder. Replace it in Dashboard → Settings → WhatsApp (or `.env`) with the real business number before launch.

## Media Storage

`MEDIA_DRIVER` selects the upload backend:

1. `cloudinary` — Cloudinary signed uploads
2. `supabase` — Supabase Storage
3. blank — local `/public/uploads` fallback for local development only

Production should always set Cloudinary or Supabase; production uploads are rejected when no persistent driver is configured, and the local fallback is not durable on Vercel.

## Marketing & SEO

- Dashboard SEO defaults: title template, description, keywords, OG image, canonical base and robots policy.
- Per-entity SEO fields for products, categories, collections, blogs and pages.
- Canonical URLs, Open Graph/Twitter metadata and Organization/WebSite JSON-LD.
- Database-driven `sitemap.xml` and `robots.txt`, controlled by the sitemap setting.
- GA4 and Meta Pixel load from dashboard tracking IDs with env fallbacks.
- Storefront events are stored in the database and summarised in Dashboard → Marketing & SEO.
- Coupons are managed in Dashboard → Marketing & SEO.

## API Overview

All responses use a consistent envelope:

```json
{ "success": true, "data": {}, "meta": {} }
```

Errors use:

```json
{ "success": false, "error": { "message": "...", "details": null } }
```

Public reads:

- `GET /api/products`, `/api/products/:id`
- `GET /api/categories`, `/api/categories/:id`
- `GET /api/collections`, `/api/collections/:id`
- `GET /api/banners`
- `GET /api/blogs`, `/api/blogs/:id`
- `GET /api/content/pages`, `/api/content/pages/:id`
- `GET /api/testimonials`, `/api/faqs`
- `GET /api/settings` (public groups only)
- `GET /api/health`
- `POST /api/contact`, `/api/quotes`, `/api/orders`, `/api/newsletter`, `/api/events`
- `GET /api/track-order`
- `GET /api/payments/config`
- `POST /api/payments/create`, `/api/payments/verify`, `/api/payments/webhook`
- `POST /api/whatsapp/webhook`

Owner-only (session required):

- CRUD for products, categories, collections, banners, media, blogs, pages, testimonials, FAQs and coupons
- `GET /api/orders`, `GET/PATCH /api/orders/:id`
- Leads, clients, follow-ups, conversion and CSV export
- `GET /api/dashboard/stats`, `GET /api/marketing`
- `GET/PUT /api/settings`
- `GET /api/whatsapp/config`, `/api/whatsapp/messages`, `POST /api/whatsapp/send`

## Deployment (Vercel)

1. Push the project to a Git repository and import it into Vercel.
2. Provision PostgreSQL (Vercel Postgres, Neon, Supabase, RDS, etc.) and set `DATABASE_URL`.
3. Set all required environment variables in Vercel. Set `SITE_URL` to your production domain and `MEDIA_DRIVER` to Cloudinary or Supabase.
4. Run migrations during the build or as a release step:

   ```bash
   npx prisma migrate deploy
   ```

5. Optionally seed a fresh database once:

   ```bash
   npm run db:seed
   ```

6. Build command: `npm run build` (runs `prisma generate` automatically).
7. After deployment, update Dashboard → Settings → SEO → Canonical base to the production domain.
8. Configure the Razorpay webhook URL if online payments are enabled.
9. Replace demo contact details, social links, office addresses, WhatsApp number and content before launch.

## Verification

```bash
npm run lint
npm run build
```

The production build was verified with all public, dashboard, API, sitemap and robots routes compiling. Runtime checks covered owner login, dashboard access, protected APIs, CMS page creation/public reflection/deletion, collection and blog routes, and rejection of manual `paid` status.

## Known Integration Points

These require owner-provided values and are intentionally not fabricated:

- Real WhatsApp Business number and Cloud API credentials
- Razorpay live/test credentials and webhook secret
- Production media storage credentials
- Real contact email, phone, offices, social profiles and legal copy
- Final product imagery/copy if the seeded demo catalogue should be replaced

## Demo Data

The seed includes fictional demo products, testimonials, blogs, offices and contact details. Review and replace them before a production launch.
