import { z } from 'zod';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import { SESSION_COOKIE, requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson } from '@/lib/api/response';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.'),
  newPassword: z
    .string()
    .min(8, 'Use at least 8 characters.')
    .max(200, 'Password is too long.')
    .refine((value) => /[a-zA-Z]/.test(value) && /\d/.test(value), {
      message: 'Include at least one letter and one number.',
    }),
});

export const PUT = handleRoute(async (request) => {
  const owner = await requireOwner();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateLimit(`password:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 }).allowed) {
    throw new ApiError(429, 'Too many password attempts. Please wait a few minutes.');
  }

  const body = await readJson(request);
  const data = passwordSchema.parse(body);

  const record = await prisma.owner.findUnique({ where: { id: owner.id } });
  if (!record) throw new ApiError(404, 'Owner account not found.');

  const valid = await verifyPassword(data.currentPassword, record.passwordHash);
  if (!valid) throw new ApiError(422, 'Your current password is incorrect.');

  if (await verifyPassword(data.newPassword, record.passwordHash)) {
    throw new ApiError(422, 'Choose a password different from your current one.');
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const currentHash = token ? createHash('sha256').update(token).digest('hex') : null;

  await prisma.$transaction([
    prisma.owner.update({
      where: { id: owner.id },
      data: { passwordHash: await hashPassword(data.newPassword) },
    }),
    prisma.session.deleteMany({
      where: { ownerId: owner.id, ...(currentHash ? { tokenHash: { not: currentHash } } : {}) },
    }),
  ]);

  return apiSuccess({ updated: true });
});
