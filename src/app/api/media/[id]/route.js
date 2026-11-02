import { unlink } from 'node:fs/promises';
import path from 'node:path';
import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson, serialize } from '@/lib/api/response';
import { mediaUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const PATCH = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const body = await readJson(request);
  const data = mediaUpdateSchema.parse(body);
  const media = await prisma.media.update({ where: { id }, data });
  return apiSuccess(serialize(media));
});

export const DELETE = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new ApiError(404, 'Media not found.');

  await prisma.media.delete({ where: { id } });

  if (media.provider === 'local' && media.url.startsWith('/uploads/')) {
    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.resolve(process.cwd(), 'public', media.url.replace(/^\//, ''));
    if (filePath.startsWith(uploadsRoot)) {
      await unlink(filePath).catch(() => {});
    }
  }

  return apiSuccess({ id });
});
