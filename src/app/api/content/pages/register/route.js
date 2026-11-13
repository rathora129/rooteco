import { requireOwner } from '@/lib/auth';
import { apiSuccess, handleRoute } from '@/lib/api/response';
import { registerMissingPages } from '@/lib/pages/register';

export const dynamic = 'force-dynamic';

export const POST = handleRoute(async () => {
  await requireOwner();
  return apiSuccess(await registerMissingPages());
});
