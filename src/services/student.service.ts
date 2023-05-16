import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Student } from '../schemas/student.schema';
import { Model } from 'mongoose';
import { IStudent } from '../types/student';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
  ) {}

  async createStudent(fileData) {
    const error = [];
    for (const data of fileData) {
      const candidate = await this.studentModel.findOne({ email: data.email });
      if (!candidate) {
        const newStudent = new this.studentModel(data);
        await newStudent
          .save()
          .then()
          .catch((e) => {
            error.push(data.email);
          });
      } else {
        error.push(data.email);
      }
    }

    return true;
  }

  async getAllStudent(): Promise<IStudent[]> {
    return this.studentModel.find();
  }

  async getStudentByChatId(id: number) {
    const students: Array<IStudent> = await this.studentModel.find({
      chat: id,
    });

    return students;
  }

  async updateStudent(studentData: IStudent) {
    const student: IStudent = await this.studentModel
      .updateOne({ _id: studentData._id }, studentData)
      .then(async () => {
        return this.studentModel.findById(studentData._id);
      });
    return student;
  }
}
