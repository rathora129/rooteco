import { requireOwner } from '@/lib/auth';
import { apiSuccess, handleRoute } from '@/lib/api/response';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async () => {
  await requireOwner();
  const settings = await getSettings();
  const sending = Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  const webhookVerification = Boolean(process.env.WHATSAPP_VERIFY_TOKEN);
  const incomingEvents = Boolean(process.env.WHATSAPP_APP_SECRET);

  return apiSuccess({
    sending,
    webhookVerification,
    incomingEvents,
    ready: sending && webhookVerification && incomingEvents,
    displayNumber: settings.whatsapp?.number || '',
    defaultMessage: settings.whatsapp?.message || '',
    enabled: settings.whatsapp?.enabled !== false,
    webhookPath: '/api/whatsapp/webhook',
  });
});
