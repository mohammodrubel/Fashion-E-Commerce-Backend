import { z } from 'zod';

const CreateSizeSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .min(1, 'Name must be at least 1 character')
      .max(50, 'Name must be at most 50 characters'),
  }),
});

const UpdateSizeSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: 'Name must be a string',
      })
      .min(1, 'Name must be at least 1 character')
      .max(50, 'Name must be at most 50 characters')
      .optional(),
  }),
});

const SizeValidation = {
  CreateSizeSchema,
  UpdateSizeSchema,
};

export default SizeValidation;
