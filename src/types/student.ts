import { ObjectId } from "mongoose";
import * as mongoose from "mongoose";

export interface IStudent {
  _id: string;
  name: string;
  phone: string;
  email: string;
  telegram: string;
  chat: ObjectId;
  lessons?: ILesson[];
}


export interface ILesson {
  _id: mongoose.Types.ObjectId;
  title: string;
}