import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ColorService } from './color.service';

const CreateColor = catchAsync(async (req: Request, res: Response) => {
  const result = await ColorService.CreateColor(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Color created successfully',
    data: result,
  });
});

const GetAllColors = catchAsync(async (_req: Request, res: Response) => {
  const result = await ColorService.GetAllColors();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Colors retrieve successful',
    data: result,
  });
});

const GetSingleColor = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await ColorService.GetSingleColor(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Color retrieve successful',
    data: result,
  });
});

const UpdateColor = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await ColorService.UpdateColor(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Color updated successfully',
    data: result,
  });
});

const DeleteColor = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  await ColorService.DeleteColor(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.NO_CONTENT,
  });
});

export const ColorController = {
  CreateColor,
  GetAllColors,
  GetSingleColor,
  UpdateColor,
  DeleteColor,
};
