import { makeItemHandlers } from '@/lib/api/resource';
import { couponResource } from '@/lib/api/resources';

export const dynamic = 'force-dynamic';
export const { GET, PATCH, DELETE } = makeItemHandlers(couponResource);
