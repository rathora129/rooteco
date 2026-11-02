import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { apiSuccess, handleRoute, readJson } from '@/lib/api/response';
import { getSettings, publicSettings, updateSettings } from '@/lib/settings';
import { settingsSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async () => {
  const settings = await getSettings();
  const owner = await requireOwner().catch(() => null);
  return apiSuccess(owner ? settings : publicSettings(settings));
});

export const PUT = handleRoute(async (request) => {
  await requireOwner();
  const body = await readJson(request);
  const groups = settingsSchema.parse(body);
  const settings = await updateSettings(groups);
  return apiSuccess(settings);
});
