import * as mongoose from "mongoose";


export interface IRole {
  _id: mongoose.Types.ObjectId;
  name?: string;
  title?: string;
}

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  password?: string;
  role: IRole;
  chat?: [IChat];
}

export interface IChat {
  _id: mongoose.Types.ObjectId;
  title?: string;
}
