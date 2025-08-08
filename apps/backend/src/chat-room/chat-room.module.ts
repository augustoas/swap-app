import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { ChatRoom } from '../database/entities/chatRoom.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ChatRoomController],
  providers: [ChatRoomService],
  imports: [AuthModule, TypeOrmModule.forFeature([ChatRoom])],
  exports: [ChatRoomService],
})
export class ChatRoomModule {}
