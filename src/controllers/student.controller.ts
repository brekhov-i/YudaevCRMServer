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
  UseInterceptors,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RoleAuthGuard } from '../configAuth/roles.guard';
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import * as csvParser from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import { StudentService } from '../services/student.service';
import { IStudent } from '../types/student';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('')
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(new RoleAuthGuard(['admin']))
  async createStudent() {}

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
        results.push({
          name: `${data['Имя']} ${data['Фамилия']}`,
          phone: data['Телефон'],
          email: data.Email,
          telegram: data.nik_telegram,
        });
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

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  async getStudentByChatId(
    @Res() res: Response,
    @Param() param: { id: string },
  ) {
    const { id } = param;
    const students: IStudent[] = await this.studentService.getStudentByChatId(
      Number(id),
    );

    res.status(200).send(students);
  }

  @Put('/')
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(new RoleAuthGuard(['admin']))
  async updateStudent(@Res() res: Response, @Body() body: IStudent) {
    const newStudent = await this.studentService.updateStudent(body);
    res.status(200).send(newStudent);
  }
}
