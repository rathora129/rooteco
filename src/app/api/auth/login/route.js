import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSession, pruneExpiredSessions, setSessionCookie } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson } from '@/lib/api/response';
import { loginSchema } from '@/lib/validation';
import { rateLimit, resetRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export const POST = handleRoute(async (request) => {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local';
  const limit = rateLimit(`login:${ip}`, { limit: 8, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    throw new ApiError(429, 'Too many login attempts. Please wait a few minutes and try again.');
  }

  const body = await readJson(request);
  const { email, password } = loginSchema.parse(body);

  const owner = await prisma.owner.findUnique({ where: { email: email.toLowerCase() } });
  if (!owner) {
    await hashPassword(password);
    throw new ApiError(401, 'Invalid email or password.');
  }

  const valid = await verifyPassword(password, owner.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid email or password.');

  await pruneExpiredSessions();
  const { token, expiresAt } = await createSession(owner.id);
  await setSessionCookie(token, expiresAt);
  resetRateLimit(`login:${ip}`);

  return apiSuccess({
    user: { id: owner.id, email: owner.email, name: owner.name },
    expiresAt,
  });
});
