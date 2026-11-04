import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import AuthValidation from './auth.validation';
import AuthController from './auth.controller';

const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.LoginSchema),
  AuthController.Login,
);
//demo
router.post(
  '/register',
  validateRequest(AuthValidation.RegisterSchema),
  AuthController.Register,
);

router.patch(
  '/change-password',
  auth(),
  validateRequest(AuthValidation.ChangePasswordSchema),
  AuthController.ChangePassword,
);

router.patch(
  '/set-password',
  auth(),
  validateRequest(AuthValidation.SetPasswordSchema),
  AuthController.SetPassword,
);

router.post('/logout', AuthController.Logout);

router.post(
  '/forgot-password',
  validateRequest(AuthValidation.ForgotPasswordSchema),
  AuthController.ForgotPassword,
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.ResetPasswordSchema),
  AuthController.ResetPassword,
);

router.post(
  '/google',
  validateRequest(AuthValidation.GoogleLoginSchema),
  AuthController.GoogleLogin,
);

export const AuthRoutes = router;
