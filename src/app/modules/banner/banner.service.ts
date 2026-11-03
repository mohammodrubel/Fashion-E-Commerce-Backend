import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import {
  BannerFiles,
  CreateBannerPayload,
  UpdateBannerPayload,
} from './banner.interface';

const toBoolean = (val: boolean | string | undefined): boolean | undefined => {
  if (val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  return val === 'true';
};

const uploadBannerImages = async (files?: BannerFiles) => {
  const desktopFile = files?.desktopImage?.[0];
  const mobileFile = files?.mobileImage?.[0];

  const [desktopImage, mobileImage] = await Promise.all([
    desktopFile
      ? sendImageToCloudinary(desktopFile.path, desktopFile.filename)
      : Promise.resolve(undefined),
    mobileFile
      ? sendImageToCloudinary(mobileFile.path, mobileFile.filename)
      : Promise.resolve(undefined),
  ]);

  return { desktopImage, mobileImage };
};

const CreateBanner = async (
  payload: CreateBannerPayload,
  files?: BannerFiles,
) => {
  const desktopFile = files?.desktopImage?.[0];

  if (!desktopFile) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Desktop banner image is required',
    );
  }

  const { desktopImage, mobileImage } = await uploadBannerImages(files);
  const isActive = toBoolean(payload.isActive) ?? false;

  return prisma.$transaction(async (tx) => {
    if (isActive) {
      await tx.heroBanner.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    return tx.heroBanner.create({
      data: {
        desktopImage: desktopImage as string,
        mobileImage,
        collectionLabel: payload.collectionLabel,
        heading: payload.heading,
        seasonYear: payload.seasonYear,
        discoverText: payload.discoverText,
        backgroundColor: payload.backgroundColor,
        isActive,
      },
    });
  });
};

const GetAllBanners = async () => {
  return prisma.heroBanner.findMany({ orderBy: { createdAt: 'desc' } });
};

const GetActiveBanner = async () => {
  return prisma.heroBanner.findFirst({ where: { isActive: true } });
};

const GetSingleBanner = async (id: string) => {
  const banner = await prisma.heroBanner.findUnique({ where: { id } });

  if (!banner) {
    throw new AppError(httpStatus.NOT_FOUND, 'No banner found with this id');
  }

  return banner;
};

const UpdateBanner = async (
  id: string,
  payload: UpdateBannerPayload,
  files?: BannerFiles,
) => {
  const isBannerExists = await prisma.heroBanner.findUnique({
    where: { id },
  });

  if (!isBannerExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No banner found with this id');
  }

  const { desktopImage, mobileImage } = await uploadBannerImages(files);
  const isActive = toBoolean(payload.isActive);

  return prisma.$transaction(async (tx) => {
    if (isActive) {
      await tx.heroBanner.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false },
      });
    }

    return tx.heroBanner.update({
      where: { id },
      data: {
        collectionLabel: payload.collectionLabel,
        heading: payload.heading,
        seasonYear: payload.seasonYear,
        discoverText: payload.discoverText,
        backgroundColor: payload.backgroundColor,
        isActive,
        ...(desktopImage ? { desktopImage } : {}),
        ...(mobileImage ? { mobileImage } : {}),
      },
    });
  });
};

const DeleteBanner = async (id: string) => {
  const isBannerExists = await prisma.heroBanner.findUnique({
    where: { id },
  });

  if (!isBannerExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No banner found with this id');
  }

  await prisma.heroBanner.delete({ where: { id } });
};

export const BannerService = {
  CreateBanner,
  GetAllBanners,
  GetActiveBanner,
  GetSingleBanner,
  UpdateBanner,
  DeleteBanner,
};
