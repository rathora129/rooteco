import { makeCollectionHandlers } from '@/lib/api/resource';
import { pageResource } from '@/lib/api/resources';

export const dynamic = 'force-dynamic';
export const { GET, POST } = makeCollectionHandlers(pageResource);
