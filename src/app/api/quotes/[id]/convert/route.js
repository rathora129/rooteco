import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson, serialize } from '@/lib/api/response';
import { generateOrderNumber, effectivePrice } from '@/lib/orders';
import { upsertClientByContact } from '@/lib/crm';

export const dynamic = 'force-dynamic';

const convertSchema = z.object({
  addressLine1: z.string().trim().min(3).max(300),
  addressLine2: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(120),
  pincode: z.string().trim().min(3).max(20),
  country: z.string().trim().max(80).optional(),
  paymentMethod: z.enum(['bank-transfer', 'cod']).optional(),
  status: z.enum(['confirmed', 'processing']).optional(),
});

export const POST = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const body = await readJson(request);
  const address = convertSchema.parse(body);

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          images: true,
          price: true,
          salePrice: true,
        },
      },
      client: true,
    },
  });
  if (!quote) throw new ApiError(404, 'Quote not found.');
  if (quote.orderId) throw new ApiError(409, 'This quote has already been converted to an order.');

  const qty = Math.max(1, Number(quote.quantity || 1));
  const unitFromProduct = quote.product ? effectivePrice(quote.product) : null;
  const unitPrice = quote.amount
    ? Math.round((Number(quote.amount) / qty) * 100) / 100
    : unitFromProduct;
  if (!unitPrice) {
    throw new ApiError(422, 'Set a quotation amount before converting it to an order.');
  }
  const subtotal = Math.round(unitPrice * qty * 100) / 100;
  const total = quote.amount ? Number(quote.amount) : subtotal;

  const client =
    quote.client ||
    (await upsertClientByContact({
      name: quote.name,
      company: quote.company,
      email: quote.email,
      phone: quote.phone,
    }));

  const orderData = {
    number: generateOrderNumber(),
    customerName: quote.name,
    email: quote.email,
    phone: quote.phone,
    company: quote.company || null,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || null,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country || 'India',
    notes: quote.message || null,
    subtotal,
    shipping: 0,
    discount: 0,
    total,
    status: address.status || 'confirmed',
    paymentStatus: 'pending',
    paymentMethod: address.paymentMethod || 'bank-transfer',
    clientId: client?.id || null,
    items: {
      create: [
        {
          productId: quote.productId || null,
          name: quote.productName || quote.product?.name || 'Corporate gifting order',
          sku: quote.product?.sku || null,
          image: quote.product?.images?.[0] || null,
          price: unitPrice,
          qty,
        },
      ],
    },
  };

  let order = null;
  for (let attempt = 0; attempt < 4 && !order; attempt += 1) {
    try {
      order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({ data: orderData, include: { items: true } });
        await tx.quote.update({
          where: { id: quote.id },
          data: { status: 'won', orderId: created.id },
        });
        if (client && !quote.clientId) {
          await tx.quote.update({ where: { id: quote.id }, data: { clientId: client.id } });
        }
        await tx.quoteEvent.create({
          data: {
            quoteId: quote.id,
            type: 'converted',
            message: `Converted to order ${created.number}.`,
            status: 'won',
            actor: 'owner',
          },
        });
        await tx.orderEvent.create({
          data: {
            orderId: created.id,
            type: 'created',
            message: `Order created from quote for ${quote.name}.`,
            toStatus: created.status,
            paymentStatus: created.paymentStatus,
            actor: 'owner',
          },
        });
        return created;
      });
    } catch (error) {
      if (error.code === 'P2002' && String(error.meta?.target).includes('number')) {
        orderData.number = generateOrderNumber();
        continue;
      }
      throw error;
    }
  }

  if (!order) throw new ApiError(500, 'Could not convert the quote. Please try again.');
  return apiSuccess(serialize(order), undefined, 201);
});
