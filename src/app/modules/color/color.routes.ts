import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import ColorValidation from './color.validation';
import { ColorController } from './color.controller';

const router = express.Router();

router
  .route('/')
  .get(ColorController.GetAllColors)
  .post(
    auth(Role.ADMIN),
    validateRequest(ColorValidation.CreateColorSchema),
    ColorController.CreateColor,
  );

router
  .route('/:id')
  .get(ColorController.GetSingleColor)
  .patch(
    auth(Role.ADMIN),
    validateRequest(ColorValidation.UpdateColorSchema),
    ColorController.UpdateColor,
  )
  .delete(auth(Role.ADMIN), ColorController.DeleteColor);

export const ColorRoutes = router;
