import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/PickFunction';
import { AddressService } from './address.service';

const ADDRESS_FILTERABLE_FIELDS = ['searchTerm', 'userId'];
const ADDRESS_PAGINATION_FIELDS = ['page', 'limit', 'sort', 'order'];

const CreateAddress = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.CreateAddress(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Address created successfully',
    data: result,
  });
});

const GetAllAddresses = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ADDRESS_FILTERABLE_FIELDS);
  const options = pick(req.query, ADDRESS_PAGINATION_FIELDS);
  const result = await AddressService.GetAllAddresses(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Addresses retrieve successful',
    meta: result.meta,
    data: result.data,
  });
});

const GetSingleAddress = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await AddressService.GetSingleAddress(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Address retrieve successful',
    data: result,
  });
});

const UpdateAddress = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await AddressService.UpdateAddress(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Address updated successfully',
    data: result,
  });
});

const DeleteAddress = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  await AddressService.DeleteAddress(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.NO_CONTENT,
  });
});

const GetMyAddresses = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.GetMyAddresses(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Addresses retrieve successful',
    data: result,
  });
});

const CreateMyAddress = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.CreateMyAddress(req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Address created successfully',
    data: result,
  });
});

const UpdateMyAddress = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.UpdateMyAddress(
    req.user.id,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Address updated successfully',
    data: result,
  });
});

const DeleteMyAddress = catchAsync(async (req: Request, res: Response) => {
  await AddressService.DeleteMyAddress(req.user.id, req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.NO_CONTENT,
  });
});

export const AddressController = {
  CreateAddress,
  GetAllAddresses,
  GetSingleAddress,
  UpdateAddress,
  DeleteAddress,
  GetMyAddresses,
  CreateMyAddress,
  UpdateMyAddress,
  DeleteMyAddress,
};
