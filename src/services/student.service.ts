import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Student } from "../schemas/student.schema";
import * as mongoose from "mongoose";
import { Model } from "mongoose";
import { IStudent } from "../types/student";
import { Chat } from "../schemas/chat.scheme";
import { Lesson } from "../schemas/lesson.schema";
import { IChat } from "../types/user";

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
        let chat = await this.chatModel.findOne( { title: data.chat.name } )
        if ( !chat ) {
          chat = new this.chatModel( { title: data.chat.name.trim(), link: data.chat.link.trim() } )
          await chat.save()
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
          chat = new this.chatModel( { title: data.chat.name.trim(), link: data.chat.link.trim() } )
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

  async getStudentByChatId( id: string ) {
    const chat: IChat = await this.chatModel.findById( new mongoose.Types.ObjectId( id ));
    const students: Array<IStudent> = await this.studentModel.find({
      chat: chat._id,
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
      const studentLessons = student.lessons;
      let lesson = await this.lessonModel.findOne( { title: lessonTitle } )
      if ( !lesson && lessonTitle) {
        lesson = new this.lessonModel( { title: lessonTitle } )
        await lesson.save();
      }
      studentLessons.push(lesson)
      console.log(studentLessons)
      await this.studentModel.updateOne( { userId }, { lessons: studentLessons } );
      return this.studentModel.findOne({userId});
    } else {
      throw new HttpException( "Студент не найден", HttpStatus.NOT_FOUND );
    }
  }

  async getChats() {
    const chats: IChat[] = await this.chatModel.find();

    return chats;
  }

  async getChatsById(id) {
    const chats: IChat = await this.chatModel.findById(id);

    return chats;
  }

  async getStudentById(id) {
    const student: IStudent = await this.studentModel.findOne( { userId: id } );

    return student ? student : null;
  }

  async getLessons() {
    return this.lessonModel.find();
  }
}
