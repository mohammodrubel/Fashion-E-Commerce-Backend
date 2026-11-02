import { z } from 'zod';

const AddressSchema = z.object({
  fullName: z.string({ required_error: 'Address full name is required' }).min(2).max(150),
  phone: z.string({ required_error: 'Address phone is required' }).min(6).max(30),
  addressLine: z.string({ required_error: 'Address line is required' }).min(3).max(255),
  city: z.string({ required_error: 'City is required' }).min(2).max(100),
  district: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  isDefault: z.boolean().optional(),
});

const CreateUserSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(255, 'Name must be at most 255 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Email must be a valid email'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    phone: z.string().max(30).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
    address: AddressSchema.optional(),
  }),
});

const UpdateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(255).optional(),
    email: z.string().email('Email must be a valid email').optional(),
    phone: z.string().max(30).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
  }),
});

const UserValidation = {
  CreateUserSchema,
  UpdateUserSchema,
};

export default UserValidation;
