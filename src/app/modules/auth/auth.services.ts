import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import AuthUtils from './auth.utils';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import { ILogin, IRegister, IResetPassword, IGoogleLogin } from './auth.interface';
import { sendPasswordResetEmail } from '../../utils/email';

const Login = async (payload: ILogin) => {
  const user = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found with this email');
  }

  if (!user.passwordHash) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'This account has no password set. Sign in with Google or use "Forgot password".',
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.passwordHash,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const access_token = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string,
  );

  const refresh_token = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string,
  );

  return { access_token, refresh_token };
};

const Register = async (payload: IRegister) => {
  const isUserExists = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (isUserExists) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash: hashedPassword,
      role: payload.role,
    },
  });

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const access_token = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string,
  );

  const refresh_token = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string,
  );

  return { access_token, refresh_token };
};

const ChangePassword = async (
  payload: {
    old_password: string;
    new_password: string;
  },
  user: JwtPayload,
) => {
  const isUserValid = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (!isUserValid) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found');
  }

  if (!isUserValid.passwordHash) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No password set on this account yet. Use "Set password" instead.',
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.old_password,
    isUserValid.passwordHash,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid password');
  }

  const hashedPassword = await bcrypt.hash(
    payload.new_password,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedPassword },
  });
};

const SetPassword = async (
  payload: { new_password: string },
  user: JwtPayload,
) => {
  const isUserValid = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (!isUserValid) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found');
  }

  if (isUserValid.passwordHash) {
    throw new AppError(
      httpStatus.CONFLICT,
      'A password is already set on this account. Use "Change password" instead.',
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.new_password,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedPassword },
  });
};

const ForgotPassword = async (email: string) => {
  const user = await prisma.user.findFirst({ where: { email } });

  // Silent success — don't reveal whether email exists
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordTokenExpiry: expiry,
    },
  });

  const resetUrl = `${config.frontend_url}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetUrl);
};

const ResetPassword = async (payload: IResetPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: payload.token,
      resetPasswordTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null,
    },
  });
};

const GoogleLogin = async (payload: IGoogleLogin) => {
  // Verify access_token via Google userinfo endpoint
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo`,
    { headers: { Authorization: `Bearer ${payload.id_token}` } },
  );

  if (!response.ok) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid Google token');
  }

  const googleUser = await response.json() as {
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
  };

  if (!googleUser.email) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Google account has no email');
  }

  let user = await prisma.user.findFirst({
    where: { email: googleUser.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: googleUser.name || googleUser.email,
        email: googleUser.email,
        passwordHash: null,
        role: 'USER',
      },
    });
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const access_token = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string,
  );

  const refresh_token = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string,
  );

  return { access_token, refresh_token };
};

const AuthService = {
  Login,
  Register,
  ChangePassword,
  SetPassword,
  ForgotPassword,
  ResetPassword,
  GoogleLogin,
};

export default AuthService;
