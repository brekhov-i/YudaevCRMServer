import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../schemas/user.schema";
import * as mongoose from "mongoose";
import { Model } from "mongoose";
import { Role, RoleDocument } from "../schemas/role.schema";
import { IChat, IRole, IUser } from "../types/user";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { IJwt } from "../types/jwt";
import { Chat, ChatDocument } from "../schemas/chat.scheme";

@Injectable()
export class UserService {
  constructor(
    @InjectModel( User.name ) private userModel: Model<UserDocument>,
    @InjectModel( Role.name ) private roleModel: Model<RoleDocument>,
    @InjectModel( Chat.name ) private chatModel: Model<ChatDocument>,
    private readonly jwtService: JwtService
  ) {
  }

  async createUser(user: IUser) {
    const candidate = await this.userModel.findOne({ email: user.email });

    if (!candidate) {
      const role = await this.roleModel.findOne( {
        name: user.role ? user.role : "kurator"
      } );
      const salt = bcrypt.genSaltSync( 10 );
      const passwordHash = bcrypt.hashSync( user.password, salt );
      const arrChats = [];
      if ( user.chat ) {
        for ( const chatTitle of user.chat ) {
          const chat = await this.chatModel.findOne( { title: chatTitle } );
          console.log( chat._id );
          arrChats.push( chat?._id );
        }
      }

      const newUser = new this.userModel( {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role,
        chat: arrChats
      } );

      console.log( newUser );

      await newUser
        .save()
        .then( () => {
          return "Пользователь создан";
        } )
        .catch( ( e ) => {
          throw new HttpException( e, HttpStatus.BAD_REQUEST );
        } );
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
      const role = await this.roleModel.findById( user.role );
      const chats: IChat[] = [];
      if ( user.chat ) {
        if ( user.chat?.length !== 0 ) {
          for ( const chatId of user.chat ) {
            const chat = await this.chatModel.findById( chatId );
            chats.push( chat );
          }
        }
      }

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: role,
        chat: chats
      };
    } else {
      throw new HttpException(
        'Пользователь с таким email не найден',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getUserById(id: mongoose.Types.ObjectId) {
    const user: IUser = await this.userModel.findById( id );
    const role: IRole = await this.roleModel.findById(user.role);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: role,
      chat: user?.chat
    };
  }

  async verificatePassword(password, passwordHash) {
    return bcrypt.compareSync(password, passwordHash);
  }

  async getToken(user: IUser) {
    const payload: IJwt = { _id: user._id, email: user.email, role: user.role._id.toString() };

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
