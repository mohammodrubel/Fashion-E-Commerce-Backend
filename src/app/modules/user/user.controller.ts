import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { UserService } from './user.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import pick from '../../utils/PickFunction';

const USER_FILTERABLE_FIELDS = ['searchTerm', 'role', 'isActive'];
const USER_PAGINATION_FIELDS = ['page', 'limit', 'sort', 'order'];

const GetAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, USER_FILTERABLE_FIELDS);
  const options = pick(req.query, USER_PAGINATION_FIELDS);
  const result = await UserService.GetAllUsers(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users retrieve successful',
    meta: result.meta,
    data: result.data,
  });
});

const GetSingleUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await UserService.GetSingleUser(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User retrieve successful',
    data: result,
  });
});

const CreateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.CreateUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Customer created successfully',
    data: result,
  });
});

const UpdateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  const result = await UserService.UpdateUser(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Customer updated successfully',
    data: result,
  });
});

const DeleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.id;
  await UserService.DeleteUser(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.NO_CONTENT,
  });
});

export const UserController = {
  GetAllUsers,
  GetSingleUser,
  CreateUser,
  UpdateUser,
  DeleteUser,
};
