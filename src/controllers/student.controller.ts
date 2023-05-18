import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { RoleAuthGuard } from "../configAuth/roles.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import * as csvParser from "csv-parser";
import * as fs from "fs";
import * as path from "path";
import { StudentService } from "../services/student.service";
import { IStudent } from "../types/student";
import { IChat } from "../types/user";
import * as ExcelJS from 'exceljs';
import { Buffer } from "buffer";

@Controller( "student" )
export class StudentController {
  constructor( private readonly studentService: StudentService ) {
  }

  @Post( "" )
  @UseGuards( AuthGuard( "jwt" ) )
  @UseGuards( new RoleAuthGuard( [ "admin" ] ) )
  async createStudent() {
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(new RoleAuthGuard(['admin']))
  @UseInterceptors(FileInterceptor('file'))
  async createStudentFromFile(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const results = [];
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      file.originalname,
    );
    await fs.promises.writeFile(filePath, file.buffer);

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        if ( Object.entries(data).length !== 0 ) {
          results.push( {
            gkId: data.id,
            name: `${ data.name } ${ data.lastname }`,
            phone: data.phone,
            email: data.email,
            telegram: data.nik_telegram,
            chat: {
              link: data.chat,
              name: data.chatname
            }
          } );
        }
      })
      .on('end', () => {
        this.studentService.createStudent(results);
        fs.unlinkSync(filePath);
      });

    res.status(200).send('Все студенты загружены');
  }

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  async getStudent(@Res() res: Response) {
    const students: IStudent[] = await this.studentService.getAllStudent();

    res.status(200).send(students);
  }

  @Get( "/chat/:id" )
  @UseGuards( AuthGuard( "jwt" ) )
  async getStudentByChatId(
    @Res() res: Response,
    @Param() param: { id: string },
  ) {
    const { id } = param;
    const students: IStudent[] = await this.studentService.getStudentByChatId(
      id
    );

    res.status(200).send(students);
  }

  @Put('/')
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(new RoleAuthGuard(['admin']))
  async updateStudent(@Res() res: Response, @Body() body: IStudent) {
    const newStudent = await this.studentService.updateStudent( body );
    res.status( 200 ).send( newStudent );
  }

  @Post( "/addLesson" )
  async addLesson( @Res() res: Response, @Param() param: { idUser: string, lesson: string } ) {
    await this.studentService.addLesson( param );

    res.status( 200 ).send( "Обновлено" );
  }

  @Get( "/getChats" )
  @UseGuards( AuthGuard( "jwt" ) )
  @UseGuards( new RoleAuthGuard( [ "admin" ] ) )
  async getChats( @Res() res: Response ) {
    const chats: IChat[] = await this.studentService.getChats();

    res.status( 200 ).send( chats );
  }

  @Post('/getExcel')
  async generateExcel(@Res() res, @Body() body: IStudent[]) {
    // Создание нового Excel-документа
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet( 'Чат 1' );

    worksheet.getCell( `A1` ).value = "Имя";
    worksheet.getCell( `B1` ).value = "Email";
    worksheet.getCell( `C1` ).value = "Telegram";
    worksheet.getCell( `D1` ).value = "Телефон";
    worksheet.getCell( `E1` ).value = "Последний пройденный урок";

    worksheet.getRow( 1 ).font = { bold: true };

    body.forEach( ( student, index ) => {
      worksheet.getCell( `A${ index + 2 }` ).value = student.name;
      worksheet.getCell( `B${ index + 2 }` ).value = student.email;
      worksheet.getCell( `C${ index + 2 }` ).value = student.telegram;
      worksheet.getCell( `D${ index + 2 }` ).value = student.phone;
      worksheet.getCell( `E${ index + 2 }` ).value = student.lessons ? student.lessons[student.lessons?.length - 1].title : "";
    } )

    // Генерация файла Excel
    const buffer: ExcelJS.Buffer = await workbook.xlsx.writeBuffer();

    // Отправка файла на фронтенд
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="example.xlsx"',
      'Content-Length': buffer.byteLength,
    });

    console.log(buffer)

    res.send(buffer);
  }
}
