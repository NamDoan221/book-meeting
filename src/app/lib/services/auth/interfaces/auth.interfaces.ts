import { IRole } from "../../role/interfaces/role.interface";

export interface IPassWord {
  oldPassword: string;
  newPassword: string;
}

export interface IToken {
  Domain: string;
  Username: string;
  FullName: string;
  Address: string;
  AvatarUrl: string;
  Email: string;
  Gender: number;
  Dob: string;
  JwtToken: string;
  RefreshToken: string;
  CreateDate: string;
  UpdateDate: string;
  Active: boolean;
  Phone: string;
  Id: string;
  PositionName: string;
  DepartmentName: string;
  Roles: IRole[];
}

export interface IBodyLogin {
  username?: string;
  password?: string;
}

export interface IBodyRegisterAccount {
  email?: string;
  username?: string;
  fullName?: string;
  mobile?: string;
  address?: string;
  avatarUrl?: string;
  password?: string;
  passwordRetype?: string;
  domain?: string;
}

export interface IBodyChangeInfo {
  Email: string;
  FullName: string;
  Phone: string;
}