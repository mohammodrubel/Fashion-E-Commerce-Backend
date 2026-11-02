import { z } from 'zod';

const booleanFromFormData = z.preprocess((val) => {
  if (val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  return val === 'true';
}, z.boolean().optional());

const numberFromFormData = (message: string) =>
  z.preprocess((val) => {
    if (val === undefined || val === '') return undefined;
    if (typeof val === 'number') return val;
    const parsed = Number(val);
    return Number.isNaN(parsed) ? val : parsed;
  }, z.number({ invalid_type_error: message }).optional());

const CreateProductSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .min(2, 'Name must be at least 2 characters')
      .max(200, 'Name must be at most 200 characters'),
    slug: z
      .string({ invalid_type_error: 'Slug must be a string' })
      .min(2, 'Slug must be at least 2 characters')
      .max(220, 'Slug must be at most 220 characters')
      .optional(),
    shortDescription: z
      .string({ invalid_type_error: 'Short description must be a string' })
      .max(500, 'Short description must be at most 500 characters')
      .optional(),
    description: z
      .string({ invalid_type_error: 'Description must be a string' })
      .max(5000, 'Description must be at most 5000 characters')
      .optional(),
    categoryId: z.string({
      required_error: 'Category is required',
      invalid_type_error: 'Category must be a string',
    }),
    sku: z
      .string({ invalid_type_error: 'SKU must be a string' })
      .max(100, 'SKU must be at most 100 characters')
      .optional(),
    regularPrice: numberFromFormData('Regular price must be a number')
      .refine((val) => val !== undefined, 'Regular price is required')
      .refine((val) => (val as number) > 0, 'Regular price must be greater than 0'),
    salePrice: numberFromFormData('Sale price must be a number').refine(
      (val) => val === undefined || val >= 0,
      'Sale price cannot be negative',
    ),
    costPrice: numberFromFormData('Cost price must be a number').refine(
      (val) => val === undefined || val >= 0,
      'Cost price cannot be negative',
    ),
    stockQuantity: numberFromFormData('Stock quantity must be a number').refine(
      (val) => val === undefined || (Number.isInteger(val) && val >= 0),
      'Stock quantity must be a non-negative integer',
    ),
    tags: z
      .string({ invalid_type_error: 'Tags must be a comma-separated string' })
      .max(500, 'Tags must be at most 500 characters')
      .optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
    isFeatured: booleanFromFormData,
    seoTitle: z
      .string({ invalid_type_error: 'SEO title must be a string' })
      .max(70, 'SEO title must be at most 70 characters')
      .optional(),
    seoDescription: z
      .string({ invalid_type_error: 'SEO description must be a string' })
      .max(160, 'SEO description must be at most 160 characters')
      .optional(),
    variants: z
      .string({ invalid_type_error: 'Variants must be a JSON string' })
      .optional(),
  }),
});

const UpdateProductSchema = z.object({
  body: z.object({
    name: z
      .string({ invalid_type_error: 'Name must be a string' })
      .min(2, 'Name must be at least 2 characters')
      .max(200, 'Name must be at most 200 characters')
      .optional(),
    slug: z
      .string({ invalid_type_error: 'Slug must be a string' })
      .min(2, 'Slug must be at least 2 characters')
      .max(220, 'Slug must be at most 220 characters')
      .optional(),
    shortDescription: z
      .string({ invalid_type_error: 'Short description must be a string' })
      .max(500, 'Short description must be at most 500 characters')
      .optional(),
    description: z
      .string({ invalid_type_error: 'Description must be a string' })
      .max(5000, 'Description must be at most 5000 characters')
      .optional(),
    categoryId: z
      .string({ invalid_type_error: 'Category must be a string' })
      .optional(),
    sku: z
      .string({ invalid_type_error: 'SKU must be a string' })
      .max(100, 'SKU must be at most 100 characters')
      .optional(),
    regularPrice: numberFromFormData('Regular price must be a number').refine(
      (val) => val === undefined || val > 0,
      'Regular price must be greater than 0',
    ),
    salePrice: numberFromFormData('Sale price must be a number').refine(
      (val) => val === undefined || val >= 0,
      'Sale price cannot be negative',
    ),
    costPrice: numberFromFormData('Cost price must be a number').refine(
      (val) => val === undefined || val >= 0,
      'Cost price cannot be negative',
    ),
    stockQuantity: numberFromFormData('Stock quantity must be a number').refine(
      (val) => val === undefined || (Number.isInteger(val) && val >= 0),
      'Stock quantity must be a non-negative integer',
    ),
    tags: z
      .string({ invalid_type_error: 'Tags must be a comma-separated string' })
      .max(500, 'Tags must be at most 500 characters')
      .optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
    isFeatured: booleanFromFormData,
    seoTitle: z
      .string({ invalid_type_error: 'SEO title must be a string' })
      .max(70, 'SEO title must be at most 70 characters')
      .optional(),
    seoDescription: z
      .string({ invalid_type_error: 'SEO description must be a string' })
      .max(160, 'SEO description must be at most 160 characters')
      .optional(),
    variants: z
      .string({ invalid_type_error: 'Variants must be a JSON string' })
      .optional(),
    removeImageIds: z
      .string({ invalid_type_error: 'removeImageIds must be a JSON string' })
      .optional(),
    removeVariantIds: z
      .string({ invalid_type_error: 'removeVariantIds must be a JSON string' })
      .optional(),
  }),
});

const ProductValidation = {
  CreateProductSchema,
  UpdateProductSchema,
};

export default ProductValidation;
