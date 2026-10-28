import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';

const CreateColor = async (payload: { name: string; hexCode?: string }) => {
  const isColorExists = await prisma.color.findFirst({
    where: { name: payload.name },
  });

  if (isColorExists) {
    throw new AppError(httpStatus.CONFLICT, 'Color already exists');
  }

  return prisma.color.create({ data: payload });
};

const GetAllColors = async () => {
  return prisma.color.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { variants: true } } },
  });
};

const GetSingleColor = async (id: string) => {
  const color = await prisma.color.findUnique({ where: { id } });

  if (!color) {
    throw new AppError(httpStatus.NOT_FOUND, 'No color found with this id');
  }

  return color;
};

const UpdateColor = async (
  id: string,
  payload: { name?: string; hexCode?: string },
) => {
  const isColorExists = await prisma.color.findUnique({ where: { id } });

  if (!isColorExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No color found with this id');
  }

  return prisma.color.update({ where: { id }, data: payload });
};

const DeleteColor = async (id: string) => {
  const isColorExists = await prisma.color.findUnique({ where: { id } });

  if (!isColorExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No color found with this id');
  }

  await prisma.color.delete({ where: { id } });
};

export const ColorService = {
  CreateColor,
  GetAllColors,
  GetSingleColor,
  UpdateColor,
  DeleteColor,
};
