import { Router } from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { Role } from '@prisma/client';
import { upload } from '../../utils/sendImageToCloudinary';
import UserValidation from './user.validation';

const router = Router();

router
  .route('/me')
  .get(auth(), UserController.GetMe)
  .patch(
    auth(),
    validateRequest(UserValidation.UpdateMeSchema),
    UserController.UpdateMe,
  );

router
  .route('/me/photo')
  .patch(auth(), upload.single('photo'), UserController.UpdateMyPhoto);

router
  .route('/')
  .get(auth(Role.ADMIN), UserController.GetAllUsers)
  .post(
    auth(Role.ADMIN),
    validateRequest(UserValidation.CreateUserSchema),
    UserController.CreateUser,
  );

router
  .route('/:id')
  .get(auth(Role.ADMIN), UserController.GetSingleUser)
  .patch(
    auth(Role.ADMIN),
    validateRequest(UserValidation.UpdateUserSchema),
    UserController.UpdateUser,
  )
  .delete(auth(Role.ADMIN), UserController.DeleteUser);

export const userRouter = router;
