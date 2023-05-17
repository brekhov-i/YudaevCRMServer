import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as Mongoose from "mongoose";
import { Chat } from "./chat.scheme";
import { Lesson } from "./lesson.schema";

export type StudentDocument = HydratedDocument<Student>;

@Schema()
export class Student {

  @Prop()
  userId: string;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  telegram: string;

  @Prop()
  phone: string;

  @Prop({type: Mongoose.Schema.Types.ObjectId, ref: "Chat"})
  chat?: Chat;

  @Prop([{type: Mongoose.Schema.Types.ObjectId, ref: "Lesson"}])
  lessons: Lesson[]
}

export const StudentSchema = SchemaFactory.createForClass(Student);
