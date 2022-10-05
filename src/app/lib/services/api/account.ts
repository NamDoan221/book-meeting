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
