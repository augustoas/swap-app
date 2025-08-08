import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './helpers/globalException.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { CategoriesModule } from './categories/categories.module';
import { JobCategoriesModule } from './job-categories/job-categories.module';
import { OffersModule } from './offers/offers.module';
import { QuestionsModule } from './questions/questions.module';
import { RepliesModule } from './replies/replies.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MailModule } from './mail/mail.module';
import { TycModule } from './tyc/tyc.module';
import { NotificationModule } from './notification/notification.module';
import { WebSocketModule } from './websocket/websocket.module';
import typeorm from './config/typeorm.config';
import mail from './config/mail.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ChatModule } from './chat/chat.module';
import { ChatRoomModule } from './chat-room/chat-room.module';


@Module({
  imports: [
    AuthModule,
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm, mail],
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: '/app/uploads',
      serveRoot: '/uploads',
    }),
    // Database configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const config = configService.get<TypeOrmModuleOptions>('typeorm');
        if (!config) throw new Error('TypeORM configuration not found');
        return config;
      },
    }),
    UsersModule,
    JobsModule,
    CategoriesModule,
    JobCategoriesModule,
    OffersModule,
    QuestionsModule,
    RepliesModule,
    ReviewsModule,
    MailModule,
    TycModule,
    NotificationModule,
    WebSocketModule,
    ChatModule,
    ChatRoomModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
