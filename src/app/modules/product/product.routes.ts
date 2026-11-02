import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { upload } from '../../utils/sendImageToCloudinary';
import ProductValidation from './product.validation';
import { ProductController } from './product.controller';

const router = express.Router();

router
  .route('/')
  .get(ProductController.GetAllProducts)
  .post(
    auth(Role.ADMIN),
    upload.array('images', 10),
    validateRequest(ProductValidation.CreateProductSchema),
    ProductController.CreateProduct,
  );

router
  .route('/:id')
  .get(ProductController.GetSingleProduct)
  .patch(
    auth(Role.ADMIN),
    upload.array('images', 10),
    validateRequest(ProductValidation.UpdateProductSchema),
    ProductController.UpdateProduct,
  )
  .delete(auth(Role.ADMIN), ProductController.DeleteProduct);

export const ProductRoutes = router;
