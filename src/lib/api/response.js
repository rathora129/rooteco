export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function apiSuccess(data, meta, status = 200) {
  return Response.json(
    meta === undefined ? { success: true, data } : { success: true, data, meta },
    { status }
  );
}

export function apiError(status, message, details = null) {
  return Response.json(
    { success: false, error: { message, details } },
    { status }
  );
}

export function handleRoute(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return apiError(error.status, error.message, error.details);
      }
      if (error?.name === 'ZodError') {
        const details = (error.issues || []).map((issue) => ({
          path: issue.path?.join('.') || '',
          message: issue.message,
        }));
        return apiError(422, 'Some fields need attention.', details);
      }
      if (error?.code === 'P2002') {
        const fields = error.meta?.target;
        const label = Array.isArray(fields) ? fields.join(', ') : String(fields || 'value');
        return apiError(409, `A record with this ${label} already exists.`);
      }
      if (error?.code === 'P2003') {
        return apiError(409, 'This change references a record that no longer exists.');
      }
      if (error?.code === 'P2025') {
        return apiError(404, 'Record not found.');
      }
      console.error('[api]', error);
      return apiError(500, 'Something went wrong. Please try again.');
    }
  };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, 'Request body must be valid JSON.');
  }
}

export function parseListParams(searchParams) {
  const page = Math.max(1, Number(searchParams.get('page') || 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20) || 20));
  const sort = searchParams.get('sort') || '';
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
  const q = (searchParams.get('q') || '').trim();
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize, sort, order, q };
}

export function buildMeta(total, page, pageSize) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    hasNext: page * pageSize < total,
    hasPrev: page > 1,
  };
}

export function serialize(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'object') {
    if (typeof value.toNumber === 'function') return value.toNumber();
    if (Array.isArray(value)) return value.map(serialize);
    if (value instanceof Date) return value.toISOString();
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serialize(item)]));
  }
  return value;
}
