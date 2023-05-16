import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UserService } from '../services/user.service';
import { IUser } from '../types/user';
import { AuthGuard } from '@nestjs/passport';
import { IJwt } from '../types/jwt';
import { RoleAuthGuard } from '../configAuth/roles.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  async login(
    @Res() res: Response,
    @Body() body: { email: string; password: string },
  ) {
    const { email, password } = body;
    const user: IUser = await this.userService.findUser(email);

    const passIsValid = this.userService.verificatePassword(
      password,
      user.password,
    );

    if (!passIsValid)
      throw new HttpException('Пароль неверный', HttpStatus.UNAUTHORIZED);

    const token = await this.userService.getToken(user);

    res.send(token);
  }

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Req() req: Request, @Res() res: Response) {
    const token: string = req.headers.authorization.split(' ')[1];
    const { id }: IJwt = this.userService.getInfoToken(token);
    const user = await this.userService.getUserById(id);

    res.status(200).send(user);
  }

  @Post('/create')
  async createUser(@Res() res: Response, @Body() body: IUser) {
    await this.userService.createUser(body);
    res.status(200).send('1');
  }
}
