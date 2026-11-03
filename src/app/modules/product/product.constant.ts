export const LOW_STOCK_THRESHOLD = 5;

export const PRODUCT_SEARCHABLE_FIELDS = ['name', 'sku', 'slug'];

export const PRODUCT_FILTERABLE_FIELDS = [
  'searchTerm',
  'category',
  'categoryIds',
  'status',
  'minPrice',
  'maxPrice',
  'stockStatus',
  'featured',
  'onSale',
  'colorIds',
  'sizeIds',
  'tags',
  'startDate',
  'endDate',
];

export const PRODUCT_PAGINATION_FIELDS = ['page', 'limit', 'sort', 'order'];

// Maps the public `sort` query value to the actual Prisma column.
// 'featured' is handled separately in the service (multi-field orderBy).
export const PRODUCT_SORT_FIELD_MAP: Record<string, string> = {
  name: 'name',
  price: 'regularPrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};
