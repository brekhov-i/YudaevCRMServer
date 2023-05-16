import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from '../schemas/student.schema';
import { StudentController } from '../controllers/student.controller';
import { StudentService } from '../services/student.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
