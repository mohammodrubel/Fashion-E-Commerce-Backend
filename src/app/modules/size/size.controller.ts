import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SizeService } from './size.service';

const CreateSize = catchAsync(async (req: Request, res: Response) => {
  const result = await SizeService.CreateSize(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Size created successfully',
    data: result,
  });
});

const GetAllSizes = catchAsync(async (_req: Request, res: Response) => {
  const result = await SizeService.GetAllSizes();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sizes retrieve successful',
    data: result,
  });
});

const GetSingleSize = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await SizeService.GetSingleSize(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Size retrieve successful',
    data: result,
  });
});

const UpdateSize = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await SizeService.UpdateSize(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Size updated successfully',
    data: result,
  });
});

const DeleteSize = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  await SizeService.DeleteSize(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.NO_CONTENT,
  });
});

export const SizeController = {
  CreateSize,
  GetAllSizes,
  GetSingleSize,
  UpdateSize,
  DeleteSize,
};
