import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Student } from '../schemas/student.schema';
import { Model } from 'mongoose';
import { IStudent } from '../types/student';
import { Chat } from "../schemas/chat.scheme";
import { Lesson } from "../schemas/lesson.schema";

@Injectable()
export class StudentService {
  constructor(
      @InjectModel( Student.name ) private studentModel: Model<Student>,
      @InjectModel( Chat.name ) private chatModel: Model<Chat>,
      @InjectModel( Lesson.name ) private lessonModel: Model<Lesson>,
  ) {
  }

  async createStudent( fileData ) {
    const error = [];
    for (const data of fileData) {
      const candidate = await this.studentModel.findOne({ email: data.email });
      if (!candidate) {
        let chat = await this.chatModel.findOne( { name: data.chat.name } )
        if ( !chat ) {
          chat = new this.chatModel( { title: data.chat.name, link: data.chat.link } )
        }
        const newStudent = new this.studentModel( {
          userId: data.gkId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          telegram: data.telegram,
          chat,
        } );
        await newStudent
            .save()
            .then()
            .catch( ( e ) => {
              error.push( data.email );
            } );
      } else {
        let chat = await this.chatModel.findOne( { name: data.chat.name } )
        if ( !chat ) {
          chat = new this.chatModel( { title: data.chat.name, link: data.chat.link } )
        }
        await this.studentModel.updateOne( { _id: candidate._id }, {
          userId: data.gkId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          telegram: data.telegram,
          chat,
        } )
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

  async updateStudent( studentData: IStudent ) {
    const student: IStudent = await this.studentModel
        .updateOne( { _id: studentData._id }, studentData )
        .then( async () => {
          return this.studentModel.findById( studentData._id );
        } );
    return student;
  }

  async addLesson( param ) {
    const { userId, lessonTitle } = param;
    const student = await this.studentModel.findOne( { userId } );
    if ( student ) {
      let lesson = await this.lessonModel.findOne( { title: lessonTitle } )
      if ( !lesson ) {
        lesson = new this.lessonModel( { title: lesson } )
        await lesson.save();
      }
      this.studentModel.updateOne( { userId }, { lesson: lesson } );
    } else {
      throw new HttpException( "Студент не найден", HttpStatus.NOT_FOUND );
    }
  }
}
