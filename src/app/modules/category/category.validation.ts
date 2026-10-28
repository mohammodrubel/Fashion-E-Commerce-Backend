import { z } from 'zod';

const booleanFromFormData = z.preprocess((val) => {
  if (val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  return val === 'true';
}, z.boolean().optional());

const CreateCategorySchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
    slug: z
      .string({ invalid_type_error: 'Slug must be a string' })
      .min(2, 'Slug must be at least 2 characters')
      .max(120, 'Slug must be at most 120 characters')
      .optional(),
    description: z
      .string({ invalid_type_error: 'Description must be a string' })
      .max(2000, 'Description must be at most 2000 characters')
      .optional(),
    isActive: booleanFromFormData,
  }),
});

const UpdateCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ invalid_type_error: 'Name must be a string' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters')
      .optional(),
    slug: z
      .string({ invalid_type_error: 'Slug must be a string' })
      .min(2, 'Slug must be at least 2 characters')
      .max(120, 'Slug must be at most 120 characters')
      .optional(),
    description: z
      .string({ invalid_type_error: 'Description must be a string' })
      .max(2000, 'Description must be at most 2000 characters')
      .optional(),
    isActive: booleanFromFormData,
  }),
});

const CategoryValidation = {
  CreateCategorySchema,
  UpdateCategorySchema,
};

export default CategoryValidation;
