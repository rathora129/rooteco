import { makeCollectionHandlers } from '@/lib/api/resource';
import { couponResource } from '@/lib/api/resources';

export const dynamic = 'force-dynamic';
export const { GET, POST } = makeCollectionHandlers(couponResource);
