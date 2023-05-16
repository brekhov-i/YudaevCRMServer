import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { Role, RoleSchema } from '../schemas/role.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../configAuth/jwt.stretagy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class UserModule {}
