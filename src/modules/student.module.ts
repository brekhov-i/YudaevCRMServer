import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from '../schemas/student.schema';
import { StudentController } from '../controllers/student.controller';
import { StudentService } from '../services/student.service';
import { Chat, ChatSchema } from "../schemas/chat.scheme";
import { Lesson, LessonSchema } from "../schemas/lesson.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
