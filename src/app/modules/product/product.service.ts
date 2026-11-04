import httpStatus from 'http-status';
import { Prisma, ProductStatus } from '@prisma/client';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import calculatePagination, { PaginationOptions } from '../../utils/pagination';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import {
  CreateProductPayload,
  ProductFilters,
  UpdateProductPayload,
  VariantInput,
} from './product.interface';
import { LOW_STOCK_THRESHOLD, PRODUCT_SORT_FIELD_MAP } from './product.constant';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toBoolean = (val: boolean | string | undefined): boolean | undefined => {
  if (val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  return val === 'true';
};

// multipart/form-data always sends fields as strings, and validateRequest
// does not write zod's transformed output back onto req.body, so numbers
// have to be coerced here (same caveat as category.service.ts's toBoolean).
const toNumber = (val: number | string | undefined): number | undefined => {
  if (val === undefined || val === '') return undefined;
  if (typeof val === 'number') return val;
  const parsed = Number(val);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseTags = (tags?: string): string[] | undefined => {
  if (tags === undefined) return undefined;
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const parseVariants = (variants?: string): VariantInput[] | undefined => {
  if (variants === undefined) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(variants);
  } catch {
    throw new AppError(httpStatus.BAD_REQUEST, 'Variants must be valid JSON');
  }

  if (!Array.isArray(parsed)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Variants must be an array');
  }

  parsed.forEach((variant, index) => {
    if (
      !variant ||
      typeof variant.sizeId !== 'string' ||
      typeof variant.colorId !== 'string' ||
      typeof variant.sku !== 'string' ||
      typeof variant.price !== 'number'
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Variant at index ${index} must include sizeId, colorId, sku and price`,
      );
    }
  });

  const skus = parsed.map((variant) => variant.sku);
  if (new Set(skus).size !== skus.length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Variant SKUs must be unique within a product');
  }

  return parsed as VariantInput[];
};

const parseIdArray = (value?: string): string[] | undefined => {
  if (value === undefined) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new AppError(httpStatus.BAD_REQUEST, 'Expected a JSON array of ids');
  }

  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Expected a JSON array of ids');
  }

  return parsed;
};

const assertSizesAndColorsExist = async (variants: VariantInput[]) => {
  if (!variants.length) return;

  const sizeIds = [...new Set(variants.map((v) => v.sizeId))];
  const colorIds = [...new Set(variants.map((v) => v.colorId))];

  const [sizes, colors] = await Promise.all([
    prisma.size.findMany({ where: { id: { in: sizeIds } }, select: { id: true } }),
    prisma.color.findMany({ where: { id: { in: colorIds } }, select: { id: true } }),
  ]);

  const foundSizeIds = new Set(sizes.map((s) => s.id));
  const foundColorIds = new Set(colors.map((c) => c.id));

  const missingSize = sizeIds.find((id) => !foundSizeIds.has(id));
  if (missingSize) {
    throw new AppError(httpStatus.BAD_REQUEST, `No size found with id ${missingSize}`);
  }

  const missingColor = colorIds.find((id) => !foundColorIds.has(id));
  if (missingColor) {
    throw new AppError(httpStatus.BAD_REQUEST, `No color found with id ${missingColor}`);
  }
};

const uploadImages = async (files?: Express.Multer.File[]): Promise<string[]> => {
  if (!files || !files.length) return [];
  return Promise.all(files.map((file) => sendImageToCloudinary(file.path, file.filename)));
};

const buildWhere = (filters: ProductFilters): Prisma.ProductWhereInput => {
  const andConditions: Prisma.ProductWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: filters.searchTerm, mode: 'insensitive' } },
        { sku: { contains: filters.searchTerm, mode: 'insensitive' } },
        { slug: { contains: filters.searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (filters.categoryIds) {
    const ids = filters.categoryIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (ids.length) andConditions.push({ categoryId: { in: ids } });
  } else if (filters.category) {
    andConditions.push({ categoryId: filters.category });
  }

  if (filters.colorIds) {
    const ids = filters.colorIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (ids.length) {
      andConditions.push({
        variants: { some: { colorId: { in: ids }, isActive: true } },
      });
    }
  }

  if (filters.sizeIds) {
    const ids = filters.sizeIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (ids.length) {
      andConditions.push({
        variants: { some: { sizeId: { in: ids }, isActive: true } },
      });
    }
  }

  if (toBoolean(filters.onSale)) {
    andConditions.push({ salePrice: { not: null } });
  }

  if (filters.status) {
    andConditions.push({ status: filters.status as ProductStatus });
  }

  if (filters.featured !== undefined) {
    andConditions.push({ isFeatured: toBoolean(filters.featured) });
  }

  if (filters.minPrice || filters.maxPrice) {
    andConditions.push({
      regularPrice: {
        ...(filters.minPrice ? { gte: Number(filters.minPrice) } : {}),
        ...(filters.maxPrice ? { lte: Number(filters.maxPrice) } : {}),
      },
    });
  }

  if (filters.tags) {
    andConditions.push({
      tags: { hasSome: filters.tags.split(',').map((tag) => tag.trim()).filter(Boolean) },
    });
  }

  if (filters.startDate || filters.endDate) {
    andConditions.push({
      createdAt: {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      },
    });
  }

  if (filters.stockStatus === 'OUT_OF_STOCK') {
    andConditions.push({ stockQuantity: { lte: 0 } });
  } else if (filters.stockStatus === 'LOW_STOCK') {
    andConditions.push({ stockQuantity: { gt: 0, lte: LOW_STOCK_THRESHOLD } });
  } else if (filters.stockStatus === 'IN_STOCK') {
    andConditions.push({ stockQuantity: { gt: LOW_STOCK_THRESHOLD } });
  }

  return andConditions.length ? { AND: andConditions } : {};
};

const productIncludes = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { include: { size: true, color: true } },
};

const CreateProduct = async (
  payload: CreateProductPayload,
  files?: Express.Multer.File[],
) => {
  const slug = slugify(payload.slug || payload.name);

  const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'No category found with this id');
  }

  const isProductExists = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, ...(payload.sku ? [{ sku: payload.sku }] : [])],
    },
  });
  if (isProductExists) {
    throw new AppError(httpStatus.CONFLICT, 'Product already exists');
  }

  const tags = parseTags(payload.tags) ?? [];
  const variants = parseVariants(payload.variants) ?? [];
  await assertSizesAndColorsExist(variants);

  const imageUrls = await uploadImages(files);

  return prisma.product.create({
    data: {
      name: payload.name,
      slug,
      shortDescription: payload.shortDescription,
      description: payload.description,
      categoryId: payload.categoryId,
      sku: payload.sku,
      regularPrice: toNumber(payload.regularPrice) as number,
      salePrice: toNumber(payload.salePrice),
      costPrice: toNumber(payload.costPrice),
      stockQuantity: toNumber(payload.stockQuantity) ?? 0,
      tags,
      status: payload.status ?? ProductStatus.DRAFT,
      isFeatured: toBoolean(payload.isFeatured) ?? false,
      seoTitle: payload.seoTitle,
      seoDescription: payload.seoDescription,
      images: {
        create: imageUrls.map((url, index) => ({ url, sortOrder: index })),
      },
      variants: {
        create: variants.map((variant) => ({
          sizeId: variant.sizeId,
          colorId: variant.colorId,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock ?? 0,
          isActive: toBoolean(variant.isActive) ?? true,
        })),
      },
    },
    include: productIncludes,
  });
};

const GetAllProducts = async (filters: ProductFilters, options: PaginationOptions) => {
  const { page, limit, skip, sort, order } = calculatePagination(options);
  const where = buildWhere(filters);
  const orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] =
    sort === 'featured'
      ? [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
      : { [PRODUCT_SORT_FIELD_MAP[sort] ?? 'createdAt']: order === 'asc' ? 'asc' : 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: productIncludes,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) || 1 },
    data: products,
  };
};

const GetPriceRange = async () => {
  const result = await prisma.product.aggregate({
    where: { status: ProductStatus.ACTIVE },
    _min: { regularPrice: true },
    _max: { regularPrice: true },
  });

  return {
    min: result._min.regularPrice ? Number(result._min.regularPrice) : 0,
    max: result._max.regularPrice ? Number(result._max.regularPrice) : 0,
  };
};

const GetSingleProduct = async (idOrSlug: string) => {
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: productIncludes,
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'No product found with this id or slug');
  }

  return product;
};

const UpdateProduct = async (
  id: string,
  payload: UpdateProductPayload,
  files?: Express.Multer.File[],
) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existingProduct) {
    throw new AppError(httpStatus.NOT_FOUND, 'No product found with this id');
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, 'No category found with this id');
    }
  }

  const slug = payload.slug || payload.name ? slugify(payload.slug || payload.name!) : undefined;

  if (slug || payload.sku) {
    const isDuplicate = await prisma.product.findFirst({
      where: {
        id: { not: id },
        OR: [...(slug ? [{ slug }] : []), ...(payload.sku ? [{ sku: payload.sku }] : [])],
      },
    });
    if (isDuplicate) {
      throw new AppError(httpStatus.CONFLICT, 'Product already exists');
    }
  }

  const tags = parseTags(payload.tags);
  const variants = parseVariants(payload.variants);
  if (variants) {
    await assertSizesAndColorsExist(variants);
  }
  const removeImageIds = parseIdArray(payload.removeImageIds) ?? [];
  const removeVariantIds = parseIdArray(payload.removeVariantIds) ?? [];
  const newImageUrls = await uploadImages(files);

  const maxSortOrder = existingProduct.images.reduce(
    (max, image) => Math.max(max, image.sortOrder),
    -1,
  );

  return prisma.$transaction(async (tx) => {
    if (removeImageIds.length) {
      await tx.productImage.deleteMany({ where: { id: { in: removeImageIds }, productId: id } });
    }

    if (newImageUrls.length) {
      await tx.productImage.createMany({
        data: newImageUrls.map((url, index) => ({
          productId: id,
          url,
          sortOrder: maxSortOrder + 1 + index,
        })),
      });
    }

    if (removeVariantIds.length) {
      await tx.productVariant.deleteMany({ where: { id: { in: removeVariantIds }, productId: id } });
    }

    if (variants) {
      for (const variant of variants) {
        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              sizeId: variant.sizeId,
              colorId: variant.colorId,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock ?? 0,
              isActive: toBoolean(variant.isActive) ?? true,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              sizeId: variant.sizeId,
              colorId: variant.colorId,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock ?? 0,
              isActive: toBoolean(variant.isActive) ?? true,
            },
          });
        }
      }
    }

    return tx.product.update({
      where: { id },
      data: {
        name: payload.name,
        slug,
        shortDescription: payload.shortDescription,
        description: payload.description,
        categoryId: payload.categoryId,
        sku: payload.sku,
        regularPrice: toNumber(payload.regularPrice),
        salePrice: toNumber(payload.salePrice),
        costPrice: toNumber(payload.costPrice),
        stockQuantity: toNumber(payload.stockQuantity),
        tags,
        status: payload.status,
        isFeatured: toBoolean(payload.isFeatured),
        seoTitle: payload.seoTitle,
        seoDescription: payload.seoDescription,
      },
      include: productIncludes,
    });
  });
};

const DeleteProduct = async (id: string) => {
  const isProductExists = await prisma.product.findUnique({ where: { id } });

  if (!isProductExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No product found with this id');
  }

  await prisma.product.delete({ where: { id } });
};

export const ProductService = {
  CreateProduct,
  GetAllProducts,
  GetPriceRange,
  GetSingleProduct,
  UpdateProduct,
  DeleteProduct,
};
