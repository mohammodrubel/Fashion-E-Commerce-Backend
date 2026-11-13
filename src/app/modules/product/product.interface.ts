import { ProductStatus } from '@prisma/client';

export type VariantInput = {
  id?: string;
  sizeId: string;
  colorId: string;
  sku?: string; // ignored: generated server-side
  price: number;
  stock?: number;
  isActive?: boolean;
};

export type CreateProductPayload = {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
  sku?: string;
  regularPrice: number;
  salePrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  tags?: string;
  status?: ProductStatus;
  isFeatured?: boolean | string;
  seoTitle?: string;
  seoDescription?: string;
  variants?: string;
};

export type UpdateProductPayload = Partial<CreateProductPayload> & {
  removeImageIds?: string;
  removeVariantIds?: string;
};

export type ProductFilters = {
  searchTerm?: string;
  category?: string;
  categoryIds?: string;
  status?: string;
  minPrice?: string;
  maxPrice?: string;
  stockStatus?: string;
  featured?: string;
  onSale?: string;
  colorIds?: string;
  sizeIds?: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
};
