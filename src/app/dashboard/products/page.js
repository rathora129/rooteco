import { ProductsModule } from '@/components/dashboard/modules/CatalogModules';

export const metadata = { title: 'Products' };

export default function AdminProductsPage() {
  return <ProductsModule />;
}
