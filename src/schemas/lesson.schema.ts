import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema()
export class Lesson {

    @Prop()
    title: string;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
