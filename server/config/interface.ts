export interface INewUser {
  name: string;
  account: string;
  password: string;
}

export interface IDecodedToken extends INewUser {
  newUser?: INewUser;
  iat: number;
  exp: number;
}
