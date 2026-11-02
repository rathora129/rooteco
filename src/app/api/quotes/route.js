import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, buildMeta, handleRoute, parseListParams, readJson, serialize } from '@/lib/api/response';
import { quoteCreateSchema } from '@/lib/validation';
import { recordLead, upsertClientByContact } from '@/lib/crm';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async (request) => {
  await requireOwner();
  const { searchParams } = new URL(request.url);
  const params = parseListParams(searchParams);
  const status = searchParams.get('status');

  const where = {
    ...(status ? { status } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: 'insensitive' } },
            { company: { contains: params.q, mode: 'insensitive' } },
            { email: { contains: params.q, mode: 'insensitive' } },
            { phone: { contains: params.q, mode: 'insensitive' } },
            { productName: { contains: params.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, quotes] = await Promise.all([
    prisma.quote.count({ where }),
    prisma.quote.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, slug: true, images: true } },
        client: { select: { id: true, name: true, company: true } },
        order: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
    }),
  ]);

  return apiSuccess(serialize(quotes), buildMeta(total, params.page, params.pageSize));
});

export const POST = handleRoute(async (request) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateLimit(`quote:${ip}`, { limit: 8, windowMs: 10 * 60 * 1000 }).allowed) {
    throw new ApiError(429, 'Too many quote requests. Please try again later.');
  }

  const body = await readJson(request);
  const data = quoteCreateSchema.parse(body);

  let product = null;
  if (data.productId) {
    product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, name: true, slug: true },
    });
    if (!product) throw new ApiError(422, 'The selected product is no longer available.');
  }

  const client = await upsertClientByContact({
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
  });

  const lead = await recordLead({
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    source: 'quote-form',
    productInterest: product?.name || data.productName,
    requirement: data.message || data.branding || 'Quote request',
    budget: data.budget,
    status: 'new',
  });

  const quote = await prisma.quote.create({
    data: {
      name: data.name,
      company: data.company || null,
      email: String(data.email).toLowerCase(),
      phone: data.phone,
      productId: product?.id || null,
      productName: product?.name || data.productName || null,
      quantity: data.quantity ?? null,
      budget: data.budget || null,
      branding: data.branding || null,
      message: data.message || null,
      status: 'new',
      clientId: client?.id || null,
      leadId: lead?.id || null,
    },
  });

  await prisma.quoteEvent.create({
    data: {
      quoteId: quote.id,
      type: 'created',
      message: 'Quote request submitted through the website.',
      status: 'new',
      actor: 'customer',
    },
  }).catch(() => {});

  await prisma.marketingEvent.create({
    data: {
      type: 'quote_request',
      path: '/get-a-quote',
      metadata: { quoteId: quote.id, productId: product?.id || null, quantity: data.quantity || null },
    },
  }).catch(() => {});

  return apiSuccess({ id: quote.id, received: true }, undefined, 201);
});
