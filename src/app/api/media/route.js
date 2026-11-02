import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, buildMeta, handleRoute, parseListParams, readJson, serialize } from '@/lib/api/response';
import { uploadImage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const externalMediaSchema = z.object({
  url: z.string().trim().min(1).max(1000),
  alt: z.string().trim().max(300).optional(),
  filename: z.string().trim().max(300).optional(),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
  size: z.coerce.number().int().nonnegative().optional(),
  mime: z.string().trim().max(100).optional(),
});

export const GET = handleRoute(async (request) => {
  await requireOwner();
  const { searchParams } = new URL(request.url);
  const params = parseListParams(searchParams);
  const where = params.q
    ? {
        OR: [
          { filename: { contains: params.q, mode: 'insensitive' } },
          { alt: { contains: params.q, mode: 'insensitive' } },
          { url: { contains: params.q, mode: 'insensitive' } },
        ],
      }
    : {};

  const [total, items] = await Promise.all([
    prisma.media.count({ where }),
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
    }),
  ]);

  return apiSuccess(serialize(items), buildMeta(total, params.page, params.pageSize));
});

export const POST = handleRoute(async (request) => {
  await requireOwner();
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const file = form.get('file');
    const alt = String(form.get('alt') || '').trim() || null;
    if (!(file instanceof File)) throw new ApiError(422, 'Choose an image to upload.');

    let uploaded;
    try {
      uploaded = await uploadImage(file);
    } catch (error) {
      throw new ApiError(422, error.message);
    }

    const media = await prisma.media.create({
      data: { ...uploaded, alt },
    });
    return apiSuccess(serialize(media), undefined, 201);
  }

  const body = await readJson(request);
  const data = externalMediaSchema.parse(body);
  if (!/^https?:\/\//.test(data.url) && !data.url.startsWith('/')) {
    throw new ApiError(422, 'Provide an https URL or a path starting with /.');
  }

  const media = await prisma.media.create({
    data: {
      url: data.url,
      alt: data.alt || null,
      filename: data.filename || data.url.split('/').pop() || 'media',
      width: data.width || null,
      height: data.height || null,
      size: data.size || null,
      mime: data.mime || null,
      provider: /^https?:\/\//.test(data.url) ? 'external' : 'local',
    },
  });

  return apiSuccess(serialize(media), undefined, 201);
});
