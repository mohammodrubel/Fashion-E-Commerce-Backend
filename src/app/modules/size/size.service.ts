import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';

const CreateSize = async (payload: { name: string }) => {
  const isSizeExists = await prisma.size.findFirst({
    where: { name: payload.name },
  });

  if (isSizeExists) {
    throw new AppError(httpStatus.CONFLICT, 'Size already exists');
  }

  return prisma.size.create({ data: payload });
};

const GetAllSizes = async () => {
  return prisma.size.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { variants: true } } },
  });
};

const GetSingleSize = async (id: string) => {
  const size = await prisma.size.findUnique({ where: { id } });

  if (!size) {
    throw new AppError(httpStatus.NOT_FOUND, 'No size found with this id');
  }

  return size;
};

const UpdateSize = async (id: string, payload: { name?: string }) => {
  const isSizeExists = await prisma.size.findUnique({ where: { id } });

  if (!isSizeExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No size found with this id');
  }

  return prisma.size.update({ where: { id }, data: payload });
};

const DeleteSize = async (id: string) => {
  const isSizeExists = await prisma.size.findUnique({ where: { id } });

  if (!isSizeExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No size found with this id');
  }

  await prisma.size.delete({ where: { id } });
};

export const SizeService = {
  CreateSize,
  GetAllSizes,
  GetSingleSize,
  UpdateSize,
  DeleteSize,
};
