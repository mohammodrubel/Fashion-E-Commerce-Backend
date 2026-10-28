import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CategoryService } from './category.service';

const CreateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.CreateCategory(req.body, req.file);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Category created successfully',
    data: result,
  });
});

const GetAllCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await CategoryService.GetAllCategories();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Categories retrieve successful',
    data: result,
  });
});

const GetSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await CategoryService.GetSingleCategory(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category retrieve successful',
    data: result,
  });
});

const UpdateCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await CategoryService.UpdateCategory(id, req.body, req.file);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category updated successfully',
    data: result,
  });
});

const DeleteCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  await CategoryService.DeleteCategory(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.NO_CONTENT,
  });
});

export const CategoryController = {
  CreateCategory,
  GetAllCategories,
  GetSingleCategory,
  UpdateCategory,
  DeleteCategory,
};
