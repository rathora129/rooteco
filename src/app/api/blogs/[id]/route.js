import { makeItemHandlers } from '@/lib/api/resource';
import { blogResource } from '@/lib/api/resources';

export const dynamic = 'force-dynamic';
export const { GET, PATCH, DELETE } = makeItemHandlers(blogResource);
