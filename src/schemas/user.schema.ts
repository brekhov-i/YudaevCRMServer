import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as Mongoose from "mongoose";
import { Role } from "./role.schema";
import { Chat } from "./chat.scheme";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({type: Mongoose.Schema.Types.ObjectId, ref: "Role"})
  role: Role;

  @Prop({type: Mongoose.Schema.Types.ObjectId, ref: "Chat"})
  chat?: Chat;
}

export const UserSchema = SchemaFactory.createForClass(User);
