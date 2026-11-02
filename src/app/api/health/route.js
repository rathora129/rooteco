import prisma from '@/lib/prisma';
import { apiSuccess, handleRoute } from '@/lib/api/response';
import { getSettings } from '@/lib/settings';
import { storageStatus } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async () => {
  let database = 'up';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'down';
  }

  const settings = await getSettings();

  return apiSuccess({
    database,
    storage: storageStatus(),
    whatsapp: {
      clickToChat: Boolean(settings.whatsapp.enabled && String(settings.whatsapp.number).replace(/\D/g, '')),
      apiConfigured: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
      webhookConfigured: Boolean(process.env.WHATSAPP_VERIFY_TOKEN),
      appSecretConfigured: Boolean(process.env.WHATSAPP_APP_SECRET),
    },
    payments: {
      razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      onlineEnabled: Boolean(settings.payments.onlineEnabled),
    },
    analytics: {
      ga4: Boolean(settings.marketing.ga4Id || process.env.NEXT_PUBLIC_GA_ID),
      metaPixel: Boolean(settings.marketing.metaPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID),
    },
  });
});
