import { z } from 'zod';

const CreateAddressSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: 'Customer is required' }),
    fullName: z
      .string({ required_error: 'Full name is required' })
      .min(2, 'Full name must be at least 2 characters')
      .max(150, 'Full name must be at most 150 characters'),
    phone: z
      .string({ required_error: 'Phone is required' })
      .min(6, 'Phone must be at least 6 characters')
      .max(30, 'Phone must be at most 30 characters'),
    addressLine: z
      .string({ required_error: 'Address line is required' })
      .min(3, 'Address line must be at least 3 characters')
      .max(255, 'Address line must be at most 255 characters'),
    city: z
      .string({ required_error: 'City is required' })
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City must be at most 100 characters'),
    district: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    isDefault: z.boolean().optional(),
  }),
});

const CreateMyAddressSchema = z.object({
  body: z.object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .min(2, 'Full name must be at least 2 characters')
      .max(150, 'Full name must be at most 150 characters'),
    phone: z
      .string({ required_error: 'Phone is required' })
      .min(6, 'Phone must be at least 6 characters')
      .max(30, 'Phone must be at most 30 characters'),
    addressLine: z
      .string({ required_error: 'Address line is required' })
      .min(3, 'Address line must be at least 3 characters')
      .max(255, 'Address line must be at most 255 characters'),
    city: z
      .string({ required_error: 'City is required' })
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City must be at most 100 characters'),
    district: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    isDefault: z.boolean().optional(),
  }),
});

const UpdateAddressSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(150).optional(),
    phone: z.string().min(6).max(30).optional(),
    addressLine: z.string().min(3).max(255).optional(),
    city: z.string().min(2).max(100).optional(),
    district: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    isDefault: z.boolean().optional(),
  }),
});

const AddressValidation = {
  CreateAddressSchema,
  CreateMyAddressSchema,
  UpdateAddressSchema,
};

export default AddressValidation;
