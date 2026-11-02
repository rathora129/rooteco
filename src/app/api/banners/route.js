import { makeCollectionHandlers } from '@/lib/api/resource';
import { bannerResource } from '@/lib/api/resources';

export const dynamic = 'force-dynamic';
export const { GET, POST } = makeCollectionHandlers(bannerResource);
