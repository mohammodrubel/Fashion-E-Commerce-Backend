import { z } from 'zod';

const LoginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email('Invalid email format'),
    password: z.string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    }),
  }),
});

const RegisterSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .min(3, 'Name must be at least 3 characters')
      .max(255, 'Name must be at most 255 characters'),
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email('Email must be a valid email'),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
      })
      .min(6, 'Password must be at least 6 characters'),
    role: z
      .enum(['USER', 'ADMIN'], {
        invalid_type_error: 'Role must be either USER or ADMIN',
        message: 'Role is required and must be either USER or ADMIN',
      })
      .default('USER'),
  }),
});

const ChangePasswordSchema = z.object({
  body: z.object({
    old_password: z.string({
      required_error: 'Old password is required',
      invalid_type_error: 'Old password must be a string',
    }),
    new_password: z.string({
      required_error: 'New password is required',
      invalid_type_error: 'New password must be a string',
    }),
  }),
});

const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
  }),
});

const ResetPasswordSchema = z.object({
  body: z.object({
    token: z.string({ required_error: 'Token is required' }),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

const GoogleLoginSchema = z.object({
  body: z.object({
    id_token: z.string({ required_error: 'id_token is required' }),
  }),
});

const AuthValidation = {
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  GoogleLoginSchema,
};

export default AuthValidation;
