import { ObjectId } from 'mongoose';

export interface IRole {
  _id: ObjectId;
  name: string;
  title: string;
}

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  role?: string;
  chat?: [IChat];
}

export interface IChat {
  _id: string;
  title: string;
}
