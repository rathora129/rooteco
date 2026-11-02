import { cookies } from 'next/headers';
import { SESSION_COOKIE, clearSessionCookie, destroySessionByToken } from '@/lib/auth';
import { apiSuccess, handleRoute } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export const POST = handleRoute(async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  await destroySessionByToken(token);
  await clearSessionCookie();
  return apiSuccess({ loggedOut: true });
});
