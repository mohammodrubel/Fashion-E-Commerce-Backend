import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AuthService from './auth.services';

const Login = catchAsync(async (req, res) => {
  const result = await AuthService.Login(req.body);

  const { access_token, refresh_token } = result;

  res.cookie('REFRESH_TOKEN', refresh_token, {
  httpOnly: true,       
  secure: true,          
  sameSite: 'strict',    
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // ✅ 7 days
});


  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Login successful',
    data: {
      access_token,
    },
  });
});

const Register = catchAsync(async (req, res) => {
  const result = await AuthService.Register(req.body);

  const { access_token, refresh_token } = result;

  res.cookie('REFRESH_TOKEN', refresh_token, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: {
      access_token,
    },
  });
});

const ChangePassword = catchAsync(async (req, res) => {
  await AuthService.ChangePassword(req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
  });
});

const ForgotPassword = catchAsync(async (req, res) => {
  await AuthService.ForgotPassword(req.body.email);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'If an account with that email exists, a reset link has been sent.',
  });
});

const ResetPassword = catchAsync(async (req, res) => {
  await AuthService.ResetPassword(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password reset successfully',
  });
});

const GoogleLogin = catchAsync(async (req, res) => {
  const result = await AuthService.GoogleLogin(req.body);

  const { access_token, refresh_token } = result;

  res.cookie('REFRESH_TOKEN', refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Google login successful',
    data: { access_token },
  });
});

const AuthController = {
  Login,
  Register,
  ChangePassword,
  ForgotPassword,
  ResetPassword,
  GoogleLogin,
};

export default AuthController;
