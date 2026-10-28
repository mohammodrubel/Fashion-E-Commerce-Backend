import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import SizeValidation from './size.validation';
import { SizeController } from './size.controller';

const router = express.Router();

router
  .route('/')
  .get(SizeController.GetAllSizes)
  .post(
    auth(Role.ADMIN),
    validateRequest(SizeValidation.CreateSizeSchema),
    SizeController.CreateSize,
  );

router
  .route('/:id')
  .get(SizeController.GetSingleSize)
  .patch(
    auth(Role.ADMIN),
    validateRequest(SizeValidation.UpdateSizeSchema),
    SizeController.UpdateSize,
  )
  .delete(auth(Role.ADMIN), SizeController.DeleteSize);

export const SizeRoutes = router;
