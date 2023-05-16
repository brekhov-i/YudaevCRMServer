import {
  Body,
  Controller,
  Get,
  Post,
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
  async getStudent() {}
}
