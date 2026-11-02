import { makeCollectionHandlers } from '@/lib/api/resource';
import { testimonialResource } from '@/lib/api/resources';

export const dynamic = 'force-dynamic';
export const { GET, POST } = makeCollectionHandlers(testimonialResource);
