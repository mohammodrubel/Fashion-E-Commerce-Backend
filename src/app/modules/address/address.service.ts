import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import calculatePagination, { PaginationOptions } from '../../utils/pagination';
import { AddressFilters, CreateAddressPayload, UpdateAddressPayload } from './address.interface';

const userSelect = { id: true, name: true, email: true } as const;

const buildWhere = (filters: AddressFilters): Prisma.AddressWhereInput => {
  const andConditions: Prisma.AddressWhereInput[] = [];

  if (filters.userId) {
    andConditions.push({ userId: filters.userId });
  }

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { fullName: { contains: filters.searchTerm, mode: 'insensitive' } },
        { city: { contains: filters.searchTerm, mode: 'insensitive' } },
        { addressLine: { contains: filters.searchTerm, mode: 'insensitive' } },
        { user: { name: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: filters.searchTerm, mode: 'insensitive' } } },
      ],
    });
  }

  return andConditions.length ? { AND: andConditions } : {};
};

const unsetOtherDefaults = async (userId: string, exceptId?: string) => {
  await prisma.address.updateMany({
    where: { userId, isDefault: true, ...(exceptId ? { id: { not: exceptId } } : {}) },
    data: { isDefault: false },
  });
};

const CreateAddress = async (payload: CreateAddressPayload) => {
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No customer found with this id');
  }

  const address = await prisma.address.create({
    data: {
      userId: payload.userId,
      fullName: payload.fullName,
      phone: payload.phone,
      addressLine: payload.addressLine,
      city: payload.city,
      district: payload.district,
      postalCode: payload.postalCode,
      isDefault: payload.isDefault ?? false,
    },
    include: { user: { select: userSelect } },
  });

  if (address.isDefault) {
    await unsetOtherDefaults(payload.userId, address.id);
  }

  return address;
};

const GetAllAddresses = async (filters: AddressFilters, options: PaginationOptions) => {
  const { page, limit, skip, sort, order } = calculatePagination(options);
  const where = buildWhere(filters);
  const sortField = ['city', 'createdAt'].includes(sort) ? sort : 'createdAt';

  const [addresses, total] = await Promise.all([
    prisma.address.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: order === 'asc' ? 'asc' : 'desc' },
      include: { user: { select: userSelect } },
    }),
    prisma.address.count({ where }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) || 1 },
    data: addresses,
  };
};

const GetSingleAddress = async (id: string) => {
  const address = await prisma.address.findUnique({
    where: { id },
    include: { user: { select: userSelect } },
  });

  if (!address) {
    throw new AppError(httpStatus.NOT_FOUND, 'No address found with this id');
  }

  return address;
};

const UpdateAddress = async (id: string, payload: UpdateAddressPayload) => {
  const existing = await prisma.address.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'No address found with this id');
  }

  const address = await prisma.address.update({
    where: { id },
    data: payload,
    include: { user: { select: userSelect } },
  });

  if (payload.isDefault) {
    await unsetOtherDefaults(existing.userId, id);
  }

  return address;
};

const DeleteAddress = async (id: string) => {
  const existing = await prisma.address.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'No address found with this id');
  }

  await prisma.address.delete({ where: { id } });
};

export const AddressService = {
  CreateAddress,
  GetAllAddresses,
  GetSingleAddress,
  UpdateAddress,
  DeleteAddress,
};
