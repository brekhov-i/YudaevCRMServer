import mongoose from "mongoose";

export interface IJwt {
  _id: mongoose.Types.ObjectId;
  email: string;
  role: string;
}
