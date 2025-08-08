import { IsNotEmpty, IsString, IsNumberString, Length } from 'class-validator';

export class JoinChatRoomDto {
  @IsNotEmpty()
  @IsNumberString()
  chatRoomId: string;
}

export class LeaveChatRoomDto {
  @IsNotEmpty()
  @IsNumberString()
  chatRoomId: string;
}

export class SendMessageDto {
  @IsNotEmpty()
  @IsNumberString()
  chatRoomId: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 1000)
  text: string;
}

export class MessageReceivedDto {
  id: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  text: string;
  createdDate: Date;
} 