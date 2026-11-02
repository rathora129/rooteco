import prisma from '@/lib/prisma';
import { getSessionOwner, requireOwner } from '@/lib/auth';
import {
  ApiError,
  apiSuccess,
  buildMeta,
  handleRoute,
  parseListParams,
  readJson,
  serialize,
} from '@/lib/api/response';

const FILTER_OPERATORS = new Set(['equals', 'contains', 'in', 'not']);

function applyBoolean(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

async function buildWhere(config, searchParams, isAdmin, params) {
  const conditions = [];

  if (config.publicRead && !isAdmin) {
    conditions.push(config.publicWhere || { status: 'published' });
  }

  for (const field of config.filterFields || []) {
    const value = searchParams.get(field);
    if (value === null || value === '') continue;
    if (value === 'null') {
      conditions.push({ [field]: null });
    } else {
      conditions.push({ [field]: applyBoolean(value) });
    }
  }

  if (params.q && (config.searchFields || []).length) {
    conditions.push({
      OR: config.searchFields.map((field) => ({
        [field]: { contains: params.q, mode: 'insensitive' },
      })),
    });
  }

  if (config.buildWhere) {
    const extra = await config.buildWhere({ searchParams, isAdmin, params });
    if (extra) conditions.push(extra);
  }

  if (!conditions.length) return {};
  return conditions.length === 1 ? conditions[0] : { AND: conditions };
}

function buildOrderBy(config, params) {
  if (!params.sort) return config.defaultOrderBy || { createdAt: 'desc' };
  if (config.sortMap?.[params.sort]) return config.sortMap[params.sort];
  if ((config.sortFields || []).includes(params.sort)) {
    return { [params.sort]: params.order };
  }
  return config.defaultOrderBy || { createdAt: 'desc' };
}

async function loadOne(config, id, isAdmin) {
  const where = { id };
  if (config.publicRead && !isAdmin) {
    where.AND = [config.publicWhere || { status: 'published' }];
  }
  const record = await prisma[config.model].findFirst({
    where,
    include: config.include,
  });
  if (!record) throw new ApiError(404, 'Record not found.');
  return serialize(record);
}

export function makeCollectionHandlers(config) {
  const GET = handleRoute(async (request) => {
    const isAdmin = Boolean(await getSessionOwner());
    if (!config.publicRead && !isAdmin) throw new ApiError(401, 'Authentication required.');

    const { searchParams } = new URL(request.url);
    const params = parseListParams(searchParams);
    const where = await buildWhere(config, searchParams, isAdmin, params);
    const orderBy = buildOrderBy(config, params);

    const [total, records] = await Promise.all([
      prisma[config.model].count({ where }),
      prisma[config.model].findMany({
        where,
        include: config.include,
        orderBy,
        skip: params.skip,
        take: params.take,
      }),
    ]);

    return apiSuccess(serialize(records), buildMeta(total, params.page, params.pageSize));
  });

  const POST = handleRoute(async (request) => {
    await requireOwner();
    const body = await readJson(request);
    const parsed = config.schema.parse(body);
    const data = config.prepareInput
      ? await config.prepareInput(parsed, { mode: 'create' })
      : parsed;
    const record = await prisma[config.model].create({
      data,
      include: config.include,
    });
    return apiSuccess(serialize(record), undefined, 201);
  });

  return { GET, POST };
}

export function makeItemHandlers(config) {
  const GET = handleRoute(async (request, context) => {
    const isAdmin = Boolean(await getSessionOwner());
    if (!config.publicRead && !isAdmin) throw new ApiError(401, 'Authentication required.');
    const { id } = await context.params;
    return apiSuccess(await loadOne(config, id, isAdmin));
  });

  const PATCH = handleRoute(async (request, context) => {
    await requireOwner();
    const { id } = await context.params;
    const body = await readJson(request);
    const partialSchema = config.schema.partial();
    const parsed = partialSchema.parse(body);
    const data = config.prepareInput
      ? await config.prepareInput(parsed, { mode: 'update', id })
      : parsed;
    const record = await prisma[config.model].update({
      where: { id },
      data,
      include: config.include,
    });
    return apiSuccess(serialize(record));
  });

  const DELETE = handleRoute(async (request, context) => {
    await requireOwner();
    const { id } = await context.params;
    await prisma[config.model].delete({ where: { id } });
    return apiSuccess({ id });
  });

  return { GET, PATCH, DELETE };
}

export function makeResourceRoutes(config) {
  return { ...makeCollectionHandlers(config), ...makeItemHandlers(config) };
}

export { FILTER_OPERATORS };
