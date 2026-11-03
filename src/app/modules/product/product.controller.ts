import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/PickFunction';
import { ProductService } from './product.service';
import { PRODUCT_FILTERABLE_FIELDS, PRODUCT_PAGINATION_FIELDS } from './product.constant';

const CreateProduct = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const result = await ProductService.CreateProduct(req.body, files);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Product created successfully',
    data: result,
  });
});

const GetAllProducts = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, PRODUCT_FILTERABLE_FIELDS);
  const options = pick(req.query, PRODUCT_PAGINATION_FIELDS);
  const result = await ProductService.GetAllProducts(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Products retrieve successful',
    meta: result.meta,
    data: result.data,
  });
});

const GetPriceRange = catchAsync(async (_req: Request, res: Response) => {
  const result = await ProductService.GetPriceRange();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Price range retrieve successful',
    data: result,
  });
});

const GetSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await ProductService.GetSingleProduct(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product retrieve successful',
    data: result,
  });
});

const UpdateProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const files = req.files as Express.Multer.File[] | undefined;
  const result = await ProductService.UpdateProduct(id, req.body, files);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product updated successfully',
    data: result,
  });
});

const DeleteProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  await ProductService.DeleteProduct(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.NO_CONTENT,
  });
});

export const ProductController = {
  CreateProduct,
  GetAllProducts,
  GetPriceRange,
  GetSingleProduct,
  UpdateProduct,
  DeleteProduct,
};
