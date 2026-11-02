import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson, serialize } from '@/lib/api/response';
import { whatsappSendSchema } from '@/lib/validation';
import { normalizePhoneNumber } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export const POST = handleRoute(async (request) => {
  await requireOwner();
  const body = await readJson(request);
  const data = whatsappSendSchema.parse(body);

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new ApiError(
      503,
      'WhatsApp Business Platform is pending configuration. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID to enable two-way messaging.'
    );
  }

  const to = normalizePhoneNumber(data.to).replace(/^\+/, '');
  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: data.body },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(502, payload?.error?.message || 'WhatsApp could not send the message.');
  }

  const client = data.clientId
    ? await prisma.client.findUnique({ where: { id: data.clientId } })
    : await prisma.client.findFirst({ where: { phone: { contains: to.slice(-10) } } });

  const message = await prisma.whatsAppMessage.create({
    data: {
      direction: 'outbound',
      from: String(phoneNumberId),
      to,
      body: data.body,
      status: 'sent',
      waMessageId: payload?.messages?.[0]?.id || null,
      clientId: client?.id || null,
    },
    include: { client: { select: { id: true, name: true } } },
  });

  return apiSuccess(serialize(message), undefined, 201);
});
