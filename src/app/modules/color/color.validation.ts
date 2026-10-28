import { z } from 'zod';

const hexCodeSchema = z
  .string({ invalid_type_error: 'Hex code must be a string' })
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Hex code must be a valid hex color')
  .optional();

const CreateColorSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .min(1, 'Name must be at least 1 character')
      .max(50, 'Name must be at most 50 characters'),
    hexCode: hexCodeSchema,
  }),
});

const UpdateColorSchema = z.object({
  body: z.object({
    name: z
      .string({ invalid_type_error: 'Name must be a string' })
      .min(1, 'Name must be at least 1 character')
      .max(50, 'Name must be at most 50 characters')
      .optional(),
    hexCode: hexCodeSchema,
  }),
});

const ColorValidation = {
  CreateColorSchema,
  UpdateColorSchema,
};

export default ColorValidation;
