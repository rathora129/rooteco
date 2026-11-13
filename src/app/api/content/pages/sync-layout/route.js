import { apiSuccess, handleRoute } from '@/lib/api/response';
import { requireOwner } from '@/lib/auth';
import { syncLayoutSections } from '@/lib/pages/sync-layout';

export const dynamic = 'force-dynamic';

export const POST = handleRoute(async () => {
  await requireOwner();
  return apiSuccess(await syncLayoutSections());
});
