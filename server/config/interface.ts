import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  account: string;
  password: string;
  avartar: string;
  role: string;
  type: string;
  _doc: object;
}

export interface INewUser {
  name: string;
  account: string;
  password: string;
}

export interface IDecodedToken extends INewUser {
  id?: string;
  newUser?: INewUser;
  iat: number;
  exp: number;
}
