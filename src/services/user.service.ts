import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { IRole, IUser } from '../types/user';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { IJwt } from '../types/jwt';
import { Chat, ChatDocument } from "../schemas/chat.scheme";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(user: IUser) {
    const candidate = await this.userModel.findOne({ email: user.email });

    if (!candidate) {
      const role = await this.roleModel.findOne({
        name: user.role ? user.role : 'kurator',
      });
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(user.password, salt);
      const chat = await this.chatModel.findOne({title: user.chat})

      const newUser = new this.userModel({
        name: user.name,
        email: user.email,
        password: passwordHash,
        role,
        chat
      });

      await newUser
        .save()
        .then(() => {
          return "Пользователь создан"
        })
        .catch((e) => {
          throw new HttpException(e, HttpStatus.BAD_REQUEST);
        });
    } else {
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  async findUser(email) {
    const user: IUser = await this.userModel.findOne( { email } );

    if (user) {
      return user;
    } else {
      throw new HttpException(
        'Пользователь с таким email не найден',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getUserById(id: string) {
    const user: IUser = await this.userModel.findById( id );
    if ( user ) {
      const role: IRole = await this.roleModel.findById( user.role )
      return {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: role,
        chat: user?.chat,
      };
    }
  }

  async verificatePassword(password, passwordHash) {
    return bcrypt.compareSync(password, passwordHash);
  }

  async getToken(user: IUser) {
    console.log(user)
    const payload: IJwt = { id: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  getInfoToken(token: string): IJwt {
    return this.jwtService.verify(token);
  }

  findAllUser() {}

  updateUser() {}

  deleteUser() {}
}
