import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { upload } from '../../utils/sendImageToCloudinary';
import BannerValidation from './banner.validation';
import { BannerController } from './banner.controller';

const router = express.Router();

const bannerImageUpload = upload.fields([
  { name: 'desktopImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 },
]);

router
  .route('/')
  .get(auth(Role.ADMIN), BannerController.GetAllBanners)
  .post(
    auth(Role.ADMIN),
    bannerImageUpload,
    validateRequest(BannerValidation.CreateBannerSchema),
    BannerController.CreateBanner,
  );

router.route('/active').get(BannerController.GetActiveBanner);

router
  .route('/:id')
  .get(auth(Role.ADMIN), BannerController.GetSingleBanner)
  .patch(
    auth(Role.ADMIN),
    bannerImageUpload,
    validateRequest(BannerValidation.UpdateBannerSchema),
    BannerController.UpdateBanner,
  )
  .delete(auth(Role.ADMIN), BannerController.DeleteBanner);

export const BannerRoutes = router;
