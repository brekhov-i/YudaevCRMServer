import { Module } from '@nestjs/common';
import { UserModule } from './user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentModule } from './student.module';

@Module({
  imports: [
    // ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get(
          'DATABASE_USER',
        )}:${configService.get(
          'DATABASE_PASSWORD',
        )}@cluster0.5r05tv8.mongodb.net/?retryWrites=true&w=majority`,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    StudentModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
