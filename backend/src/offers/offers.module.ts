import { forwardRef, Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from '../database/entities/offer.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { ChatRoomModule } from '../chat-room/chat-room.module';
import { JobsModule } from '../jobs/jobs.module';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [OffersController],
  providers: [OffersService],
  imports: [
    AuthModule, 
    TypeOrmModule.forFeature([Offer]), 
    NotificationModule, 
    WebSocketModule,
    ChatRoomModule,
    MailModule,
    forwardRef(() => JobsModule)
  ],
  exports: [OffersService]
})
export class OffersModule {}
