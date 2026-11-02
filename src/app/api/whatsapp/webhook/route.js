import { createHmac, timingSafeEqual } from 'node:crypto';
import prisma from '@/lib/prisma';
import { apiSuccess, handleRoute } from '@/lib/api/response';
import { recordLead, upsertClientByContact } from '@/lib/crm';

export const dynamic = 'force-dynamic';

function extractBody(message) {
  if (message.text?.body) return message.text.body;
  if (message.button?.text) return message.button.text;
  if (message.interactive?.button_reply?.title) return message.interactive.button_reply.title;
  if (message.interactive?.list_reply?.title) return message.interactive.list_reply.title;
  if (message.image?.caption) return message.image.caption;
  if (message.document?.caption) return message.document.caption;
  return `[${message.type || 'message'}]`;
}

function validSignature(raw, header, secret) {
  if (!header || !header.startsWith('sha256=')) return false;
  const expected = `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`;
  const actualBuffer = Buffer.from(header);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export const GET = handleRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    return new Response('WhatsApp webhook is not configured (WHATSAPP_VERIFY_TOKEN missing).', {
      status: 503,
    });
  }

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge || '', { status: 200 });
  }

  return new Response('Verification failed.', { status: 403 });
});

export const POST = handleRoute(async (request) => {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    return new Response('WhatsApp webhook is not configured (WHATSAPP_APP_SECRET missing).', {
      status: 503,
    });
  }

  const raw = await request.text();
  if (!validSignature(raw, request.headers.get('x-hub-signature-256'), appSecret)) {
    return new Response('Invalid signature.', { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response('Invalid payload.', { status: 400 });
  }

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const contactName = value.contacts?.[0]?.profile?.name || null;
      const businessNumber = value.metadata?.display_phone_number || '';

      for (const message of value.messages || []) {
        const body = extractBody(message);
        const client = await upsertClientByContact({
          name: contactName || `WhatsApp ${message.from}`,
          phone: message.from,
        });

        await prisma.whatsAppMessage.upsert({
          where: { waMessageId: message.id },
          update: { status: 'received' },
          create: {
            direction: 'inbound',
            from: message.from,
            to: String(businessNumber).replace(/\D/g, ''),
            body,
            status: 'received',
            waMessageId: message.id,
            clientId: client?.id || null,
          },
        });

        await recordLead({
          name: contactName || `WhatsApp ${message.from}`,
          phone: message.from,
          source: 'whatsapp',
          requirement: body,
          status: 'new',
        });
      }

      for (const status of value.statuses || []) {
        await prisma.whatsAppMessage.updateMany({
          where: { waMessageId: status.id },
          data: { status: status.status },
        });
      }
    }
  }

  return apiSuccess({ received: true });
});
