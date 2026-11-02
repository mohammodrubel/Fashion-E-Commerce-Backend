import { ProductStatus } from '@prisma/client';

export type VariantInput = {
  id?: string;
  sizeId: string;
  colorId: string;
  sku: string;
  price: number;
  stock?: number;
  isActive?: boolean;
};

export type CreateProductPayload = {
  name: string;
  slug?: string;
  shortDescription?: string;
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
  status?: string;
  minPrice?: string;
  maxPrice?: string;
  stockStatus?: string;
  featured?: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
};
