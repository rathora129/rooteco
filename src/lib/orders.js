import { randomBytes } from 'node:crypto';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api/response';
import { upsertClientByContact } from '@/lib/crm';
import { findHamperBox, findHamperBranding } from '@/lib/hamper';

export const SHIPPING_FLAT = 150;
export const FREE_SHIPPING_THRESHOLD = 2000;

export function effectivePrice(product) {
  return Number(product.salePrice ?? product.price ?? 0);
}

export function generateOrderNumber() {
  const date = new Date();
  const stamp = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `RE-${stamp}-${randomBytes(2).toString('hex').toUpperCase()}`;
}

export async function resolveCoupon(code, subtotal) {
  if (!code) return { coupon: null, discount: 0 };
  const coupon = await prisma.coupon.findUnique({ where: { code: String(code).trim().toUpperCase() } });
  if (!coupon || !coupon.active) throw new ApiError(422, 'This coupon code is not valid.');
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new ApiError(422, 'This coupon has expired.');
  }
  if (coupon.minSubtotal && subtotal < Number(coupon.minSubtotal)) {
    throw new ApiError(422, `This coupon needs a minimum order of ₹${Number(coupon.minSubtotal).toLocaleString('en-IN')}.`);
  }
  const raw = coupon.type === 'percent' ? (subtotal * Number(coupon.value)) / 100 : Number(coupon.value);
  const discount = Math.min(subtotal, Math.max(0, Math.round(raw * 100) / 100));
  return { coupon, discount };
}

export async function createOrder({ customer, items, couponCode, paymentMethod, source = 'website' }) {
  if (!items?.length) throw new ApiError(422, 'Your cart is empty.');

  const standardItems = items.filter((item) => !item.custom);
  const customItems = items.filter((item) => item.custom);

  for (const item of standardItems) {
    if (!item.slug) throw new ApiError(422, 'An item in your cart is missing its product reference.');
  }
  for (const item of customItems) {
    if (!item.boxId || !item.brandingId || !Array.isArray(item.productSlugs) || !item.productSlugs.length) {
      throw new ApiError(422, 'This custom hamper is incomplete. Please rebuild it and try again.');
    }
  }

  const allSlugs = [
    ...new Set([
      ...standardItems.map((item) => item.slug),
      ...customItems.flatMap((item) => item.productSlugs),
    ]),
  ];
  const products = await prisma.product.findMany({
    where: { slug: { in: allSlugs }, status: 'published' },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      price: true,
      salePrice: true,
      images: true,
      stock: true,
      stockStatus: true,
    },
  });
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const missing = allSlugs.filter((slug) => !bySlug.has(slug));
  if (missing.length) {
    throw new ApiError(422, `Some products are no longer available: ${missing.join(', ')}`, {
      unavailable: missing,
    });
  }

  const orderItems = items.map((item) => {
    if (item.custom) {
      const box = findHamperBox(item.boxId);
      const branding = findHamperBranding(item.brandingId);
      if (!box || !branding) {
        throw new ApiError(422, 'The selected hamper box or branding option is no longer available.');
      }
      const selectedSlugs = [...new Set(item.productSlugs)];
      if (selectedSlugs.length > box.capacity) {
        throw new ApiError(422, `${box.name} can hold up to ${box.capacity} gifts.`);
      }
      const selected = selectedSlugs.map((slug) => bySlug.get(slug));
      const out = selected.find((product) => product.stockStatus === 'out');
      if (out) throw new ApiError(422, `${out.name} is currently out of stock.`);

      const price =
        box.price + branding.price + selected.reduce((sum, product) => sum + effectivePrice(product), 0);

      return {
        productId: null,
        name: `Custom Hamper — ${box.name} (${selected.length} ${selected.length === 1 ? 'gift' : 'gifts'})`,
        sku: `HAMPER-${box.id.toUpperCase()}`,
        image: box.image,
        price,
        qty: item.qty,
        color: item.color || box.name,
        variant: item.variant || `${branding.name} · ${selected.length} gifts`,
        note: item.note || null,
      };
    }

    const product = bySlug.get(item.slug);
    if (product.stockStatus === 'out') {
      throw new ApiError(422, `${product.name} is currently out of stock.`);
    }
    const price = effectivePrice(product);
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: product.images?.[0] || null,
      price,
      qty: item.qty,
      color: item.color || null,
      variant: item.variant || null,
      note: item.note || null,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const { coupon, discount } = await resolveCoupon(couponCode, subtotal);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = Math.max(0, Math.round((subtotal + shipping - discount) * 100) / 100);

  const client = await upsertClientByContact({
    name: customer.customerName,
    company: customer.company,
    email: customer.email,
    phone: customer.phone,
    city: customer.city,
  });

  const data = {
    number: generateOrderNumber(),
    customerName: customer.customerName,
    email: String(customer.email).toLowerCase(),
    phone: customer.phone,
    company: customer.company || null,
    gstin: customer.gstin || null,
    addressLine1: customer.addressLine1,
    addressLine2: customer.addressLine2 || null,
    city: customer.city,
    state: customer.state,
    pincode: customer.pincode,
    country: customer.country || 'India',
    notes: customer.notes || null,
    subtotal,
    shipping,
    discount,
    total,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: paymentMethod || 'bank-transfer',
    couponCode: coupon?.code || null,
    clientId: client?.id || null,
    items: { create: orderItems },
  };

  let order = null;
  for (let attempt = 0; attempt < 4 && !order; attempt += 1) {
    try {
      order = await prisma.order.create({ data, include: { items: true } });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('number')) {
        data.number = generateOrderNumber();
        continue;
      }
      throw error;
    }
  }
  if (!order) throw new ApiError(500, 'Could not create the order. Please try again.');

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: 'created',
      message: 'Order placed through the storefront checkout.',
      toStatus: order.status,
      paymentStatus: order.paymentStatus,
      actor: 'customer',
    },
  }).catch(() => {});

  await prisma.marketingEvent.create({
    data: {
      type: 'purchase',
      path: '/checkout',
      metadata: { orderNumber: order.number, total, itemCount: orderItems.length },
    },
  }).catch(() => {});

  return order;
}
