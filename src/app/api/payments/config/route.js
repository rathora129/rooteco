import { apiSuccess, handleRoute } from '@/lib/api/response';
import { getSettings } from '@/lib/settings';
import { paymentAvailability } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async () => {
  const settings = await getSettings();
  const availability = paymentAvailability(settings);
  return apiSuccess({
    provider: availability.provider,
    onlineEnabled: availability.enabled,
    keyId: availability.keyId,
    webhookConfigured: availability.webhookConfigured,
    methods: settings.payments?.methods || ['bank-transfer', 'cod'],
    instructions: settings.payments?.instructions || '',
  });
});
