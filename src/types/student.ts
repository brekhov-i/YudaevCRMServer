import { ObjectId } from "mongoose";

export interface IStudent {
  _id: string;
  name: string;
  phone: string;
  email: string;
  telegram: string;
  chat: ObjectId;
  lastLesson?: string;
}
