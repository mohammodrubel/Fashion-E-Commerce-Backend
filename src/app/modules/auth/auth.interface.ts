import { Role } from "@prisma/client";

export interface ILogin {
  email: string;
  password: string;
}

export interface IRegister {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface IForgotPassword {
  email: string;
}

export interface IResetPassword {
  token: string;
  password: string;
}

export interface IGoogleLogin {
  id_token: string;
}
