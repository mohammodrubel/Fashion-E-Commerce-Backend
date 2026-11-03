import { z } from 'zod';

const booleanFromFormData = z.preprocess((val) => {
  if (val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  return val === 'true';
}, z.boolean().optional());

const CreateBannerSchema = z.object({
  body: z.object({
    collectionLabel: z
      .string({ invalid_type_error: 'Collection label must be a string' })
      .max(100, 'Collection label must be at most 100 characters')
      .optional(),
    heading: z
      .string({
        required_error: 'Heading is required',
        invalid_type_error: 'Heading must be a string',
      })
      .min(1, 'Heading is required')
      .max(200, 'Heading must be at most 200 characters'),
    seasonYear: z
      .string({ invalid_type_error: 'Season/year must be a string' })
      .max(50, 'Season/year must be at most 50 characters')
      .optional(),
    discoverText: z
      .string({ invalid_type_error: 'Discover text must be a string' })
      .max(50, 'Discover text must be at most 50 characters')
      .optional(),
    backgroundColor: z
      .string({ invalid_type_error: 'Background color must be a string' })
      .max(30, 'Background color must be at most 30 characters')
      .optional(),
    isActive: booleanFromFormData,
  }),
});

const UpdateBannerSchema = z.object({
  body: z.object({
    collectionLabel: z
      .string({ invalid_type_error: 'Collection label must be a string' })
      .max(100, 'Collection label must be at most 100 characters')
      .optional(),
    heading: z
      .string({ invalid_type_error: 'Heading must be a string' })
      .min(1, 'Heading is required')
      .max(200, 'Heading must be at most 200 characters')
      .optional(),
    seasonYear: z
      .string({ invalid_type_error: 'Season/year must be a string' })
      .max(50, 'Season/year must be at most 50 characters')
      .optional(),
    discoverText: z
      .string({ invalid_type_error: 'Discover text must be a string' })
      .max(50, 'Discover text must be at most 50 characters')
      .optional(),
    backgroundColor: z
      .string({ invalid_type_error: 'Background color must be a string' })
      .max(30, 'Background color must be at most 30 characters')
      .optional(),
    isActive: booleanFromFormData,
  }),
});

const BannerValidation = {
  CreateBannerSchema,
  UpdateBannerSchema,
};

export default BannerValidation;
