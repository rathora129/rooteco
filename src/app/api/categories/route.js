import { makeCollectionHandlers } from '@/lib/api/resource';
import { categoryResource } from '@/lib/api/resources';

export const dynamic = 'force-dynamic';
export const { GET, POST } = makeCollectionHandlers(categoryResource);
