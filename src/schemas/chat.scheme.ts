import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
export class Chat {

    @Prop()
    link: string;

    @Prop()
    title: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
