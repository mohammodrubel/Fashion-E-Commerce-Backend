import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import config from '../../config';
import calculatePagination, { PaginationOptions } from '../../utils/pagination';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { CreateUserPayload, UpdateMePayload, UpdateUserPayload, UserFilters } from './user.interface';

// Never return passwordHash / reset-token fields to clients.
const safeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { orders: true, addresses: true } },
} satisfies Prisma.UserSelect;

// Same as safeSelect but also tells the client whether a password exists,
// without ever exposing the hash itself — used to toggle change vs. set
// password UI (Google-authenticated users start with no password).
const meSelect = {
  ...safeSelect,
  addresses: true,
} satisfies Prisma.UserSelect;

const buildWhere = (filters: UserFilters): Prisma.UserWhereInput => {
  const andConditions: Prisma.UserWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: filters.searchTerm, mode: 'insensitive' } },
        { email: { contains: filters.searchTerm, mode: 'insensitive' } },
        { phone: { contains: filters.searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (filters.role) {
    andConditions.push({ role: filters.role as Role });
  }

  if (filters.isActive !== undefined) {
    andConditions.push({ isActive: filters.isActive === 'true' });
  }

  return andConditions.length ? { AND: andConditions } : {};
};

const GetAllUsers = async (filters: UserFilters, options: PaginationOptions) => {
  const { page, limit, skip, sort, order } = calculatePagination(options);
  const where = buildWhere(filters);
  const sortField = ['name', 'email', 'createdAt', 'updatedAt'].includes(sort) ? sort : 'createdAt';

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: order === 'asc' ? 'asc' : 'desc' },
      select: safeSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) || 1 },
    data: users,
  };
};

const GetSingleUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { ...safeSelect, addresses: true },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found with this id');
  }

  return user;
};

const CreateUser = async (payload: CreateUserPayload) => {
  const isUserExists = await prisma.user.findFirst({ where: { email: payload.email } });

  if (isUserExists) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash: hashedPassword,
      phone: payload.phone,
      role: payload.role ?? Role.USER,
      isActive: payload.isActive ?? true,
      ...(payload.address
        ? {
            addresses: {
              create: {
                fullName: payload.address.fullName,
                phone: payload.address.phone,
                addressLine: payload.address.addressLine,
                city: payload.address.city,
                district: payload.address.district,
                postalCode: payload.address.postalCode,
                isDefault: payload.address.isDefault ?? true,
              },
            },
          }
        : {}),
    },
    select: safeSelect,
  });

  return user;
};

const UpdateUser = async (id: string, payload: UpdateUserPayload) => {
  const isUserExists = await prisma.user.findUnique({ where: { id } });

  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found with this id');
  }

  if (payload.email) {
    const isDuplicate = await prisma.user.findFirst({
      where: { id: { not: id }, email: payload.email },
    });
    if (isDuplicate) {
      throw new AppError(httpStatus.CONFLICT, 'Email already in use');
    }
  }

  return prisma.user.update({
    where: { id },
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      isActive: payload.isActive,
    },
    select: safeSelect,
  });
};

const DeleteUser = async (id: string) => {
  const isUserExists = await prisma.user.findUnique({ where: { id } });

  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found with this id');
  }

  await prisma.user.delete({ where: { id } });
};

const GetMe = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { ...meSelect, passwordHash: true },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found');
  }

  const { passwordHash, ...rest } = user;
  return { ...rest, hasPassword: Boolean(passwordHash) };
};

const UpdateMe = async (id: string, payload: UpdateMePayload) => {
  if (payload.email) {
    const isDuplicate = await prisma.user.findFirst({
      where: { id: { not: id }, email: payload.email },
    });
    if (isDuplicate) {
      throw new AppError(httpStatus.CONFLICT, 'Email already in use');
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
    },
    select: { ...meSelect, passwordHash: true },
  });

  const { passwordHash, ...rest } = user;
  return { ...rest, hasPassword: Boolean(passwordHash) };
};

const UpdateMyPhoto = async (id: string, file?: Express.Multer.File) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No photo file provided');
  }

  const url = await sendImageToCloudinary(file.path, file.filename);

  return prisma.user.update({
    where: { id },
    data: { avatar: url },
    select: safeSelect,
  });
};

export const UserService = {
  GetAllUsers,
  GetSingleUser,
  CreateUser,
  UpdateUser,
  DeleteUser,
  GetMe,
  UpdateMe,
  UpdateMyPhoto,
};
