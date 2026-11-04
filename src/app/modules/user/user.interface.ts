import { Role } from '@prisma/client';

export type CreateAddressInput = {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district?: string;
  postalCode?: string;
  isDefault?: boolean;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
  address?: CreateAddressInput;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
};

export type UpdateMePayload = {
  name?: string;
  email?: string;
  phone?: string;
};

export type UserFilters = {
  searchTerm?: string;
  role?: string;
  isActive?: string;
};
