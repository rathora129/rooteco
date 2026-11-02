import prisma from '@/lib/prisma';
import { ApiError, apiSuccess, handleRoute, readJson } from '@/lib/api/response';
import { contactSchema } from '@/lib/validation';
import { recordLead } from '@/lib/crm';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export const POST = handleRoute(async (request) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 }).allowed) {
    throw new ApiError(429, 'Too many enquiries from this connection. Please try again later.');
  }

  const body = await readJson(request);
  const data = contactSchema.parse(body);

  const lead = await recordLead({
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    city: data.city,
    productInterest: data.productInterest,
    requirement: data.requirement,
    budget: data.budget,
    source: data.source || 'contact-form',
  });

  await prisma.marketingEvent.create({
    data: {
      type: 'contact_submit',
      path: '/contact',
      metadata: { leadId: lead.id, source: lead.source },
    },
  });

  return apiSuccess({ received: true, leadId: lead.id }, undefined, 201);
});
