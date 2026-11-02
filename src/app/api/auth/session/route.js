import { getSessionOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async () => {
  const owner = await getSessionOwner();
  if (!owner) throw new ApiError(401, 'Not authenticated.');
  return apiSuccess({ user: owner });
});
