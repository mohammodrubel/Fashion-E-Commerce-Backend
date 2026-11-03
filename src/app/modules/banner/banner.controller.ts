import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BannerService } from './banner.service';
import { BannerFiles } from './banner.interface';

const CreateBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.CreateBanner(
    req.body,
    req.files as BannerFiles,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Banner created successfully',
    data: result,
  });
});

const GetAllBanners = catchAsync(async (_req: Request, res: Response) => {
  const result = await BannerService.GetAllBanners();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Banners retrieve successful',
    data: result,
  });
});

const GetActiveBanner = catchAsync(async (_req: Request, res: Response) => {
  const result = await BannerService.GetActiveBanner();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Active banner retrieve successful',
    data: result,
  });
});

const GetSingleBanner = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await BannerService.GetSingleBanner(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Banner retrieve successful',
    data: result,
  });
});

const UpdateBanner = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await BannerService.UpdateBanner(
    id,
    req.body,
    req.files as BannerFiles,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Banner updated successfully',
    data: result,
  });
});

const DeleteBanner = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  await BannerService.DeleteBanner(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.NO_CONTENT,
  });
});

export const BannerController = {
  CreateBanner,
  GetAllBanners,
  GetActiveBanner,
  GetSingleBanner,
  UpdateBanner,
  DeleteBanner,
};
