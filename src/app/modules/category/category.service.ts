import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';

type CreateCategoryPayload = {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean | string;
};

type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

// multipart/form-data always sends fields as strings, and validateRequest
// does not write zod's transformed output back onto req.body, so booleans
// have to be coerced here.
const toBoolean = (val: boolean | string | undefined): boolean | undefined => {
  if (val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  return val === 'true';
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const CreateCategory = async (
  payload: CreateCategoryPayload,
  file?: Express.Multer.File,
) => {
  const slug = slugify(payload.slug || payload.name);

  const isCategoryExists = await prisma.category.findFirst({
    where: { OR: [{ name: payload.name }, { slug }] },
  });

  if (isCategoryExists) {
    throw new AppError(httpStatus.CONFLICT, 'Category already exists');
  }

  let image: string | undefined;
  if (file) {
    image = await sendImageToCloudinary(file.path, file.filename);
  }

  return prisma.category.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description,
      isActive: toBoolean(payload.isActive) ?? true,
      image,
    },
  });
};

const GetAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
};

const GetSingleCategory = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No category found with this id',
    );
  }

  return category;
};

const UpdateCategory = async (
  id: string,
  payload: UpdateCategoryPayload,
  file?: Express.Multer.File,
) => {
  const isCategoryExists = await prisma.category.findUnique({ where: { id } });

  if (!isCategoryExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No category found with this id',
    );
  }

  const slug = payload.slug || payload.name ? slugify(payload.slug || payload.name!) : undefined;

  if (slug) {
    const isDuplicate = await prisma.category.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: payload.name }, { slug }],
      },
    });

    if (isDuplicate) {
      throw new AppError(httpStatus.CONFLICT, 'Category already exists');
    }
  }

  let image: string | undefined;
  if (file) {
    image = await sendImageToCloudinary(file.path, file.filename);
  }

  return prisma.category.update({
    where: { id },
    data: {
      name: payload.name,
      slug,
      description: payload.description,
      isActive: toBoolean(payload.isActive),
      ...(image ? { image } : {}),
    },
  });
};

const DeleteCategory = async (id: string) => {
  const isCategoryExists = await prisma.category.findUnique({ where: { id } });

  if (!isCategoryExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No category found with this id',
    );
  }

  await prisma.category.delete({ where: { id } });
};

export const CategoryService = {
  CreateCategory,
  GetAllCategories,
  GetSingleCategory,
  UpdateCategory,
  DeleteCategory,
};
