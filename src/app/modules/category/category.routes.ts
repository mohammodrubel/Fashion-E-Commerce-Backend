import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { upload } from '../../utils/sendImageToCloudinary';
import CategoryValidation from './category.validation';
import { CategoryController } from './category.controller';

const router = express.Router();

router
  .route('/')
  .get(CategoryController.GetAllCategories)
  .post(
    auth(Role.ADMIN),
    upload.single('image'),
    validateRequest(CategoryValidation.CreateCategorySchema),
    CategoryController.CreateCategory,
  );

router
  .route('/:id')
  .get(CategoryController.GetSingleCategory)
  .patch(
    auth(Role.ADMIN),
    upload.single('image'),
    validateRequest(CategoryValidation.UpdateCategorySchema),
    CategoryController.UpdateCategory,
  )
  .delete(auth(Role.ADMIN), CategoryController.DeleteCategory);

export const CategoryRoutes = router;
