import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { SESSION_COOKIE, requireOwner } from '@/lib/auth';
import { apiSuccess, handleRoute, serialize } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

async function currentTokenHash() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? createHash('sha256').update(token).digest('hex') : null;
}

export const GET = handleRoute(async () => {
  const owner = await requireOwner();
  const activeHash = await currentTokenHash();

  const sessions = await prisma.session.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, expiresAt: true, tokenHash: true },
  });

  return apiSuccess(
    serialize(
      sessions.map(({ tokenHash, ...session }) => ({
        ...session,
        current: Boolean(activeHash && tokenHash === activeHash),
      }))
    )
  );
});

export const DELETE = handleRoute(async () => {
  const owner = await requireOwner();
  const activeHash = await currentTokenHash();

  const result = await prisma.session.deleteMany({
    where: { ownerId: owner.id, ...(activeHash ? { tokenHash: { not: activeHash } } : {}) },
  });

  return apiSuccess({ revoked: result.count });
});
