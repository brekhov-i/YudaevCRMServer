import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StudentDocument = HydratedDocument<Student>;

@Schema()
export class Student {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  telegram: string;

  @Prop()
  phone: string;

  @Prop()
  idChat?: number;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
