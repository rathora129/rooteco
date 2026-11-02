import { makeCollectionHandlers } from '@/lib/api/resource';
import { collectionResource } from '@/lib/api/resources';

export const dynamic = 'force-dynamic';
export const { GET, POST } = makeCollectionHandlers(collectionResource);
