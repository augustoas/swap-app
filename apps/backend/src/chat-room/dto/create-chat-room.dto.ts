import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// defines the shape of the data required
export class CreateChatRoomDto {
  @ApiProperty({
    description: 'The ID of the job',
    example: '1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly jobId: string;

  @ApiProperty({
    description: 'The ID of the job creator',
    example: '1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly jobCreatorId: string;

  @ApiProperty({
    description: 'The ID of the job worker',
    example: '2',
    type: 'string',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly jobWorkerId: string;

  @ApiProperty({
    description: 'Whether the chat room is active',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}

export class ChatRoomPreview {
  @ApiProperty({ description: 'Chat room ID' })
  id: number;

  @ApiProperty({ description: 'Job information' })
  job: {
    id: number;
    title: string;
    description: string;
  };

  @ApiProperty({ description: 'Job creator information' })
  jobCreator: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };

  @ApiProperty({ description: 'Job worker information' })
  jobWorker: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };

  @ApiProperty({ description: 'Last message in the chat room', required: false })
  lastMessage?: {
    id: number;
    text: string;
    timestamp: Date;
    senderId: number;
    senderName: string;
  };

  @ApiProperty({ description: 'Number of unread messages for the requesting user' })
  unreadCount: number;

  @ApiProperty({ description: 'Is chat room active' })
  isActive: boolean;

  @ApiProperty({ description: 'Chat room created date' })
  createdDate: Date;

  @ApiProperty({ description: 'Chat room last updated date' })
  updatedDate: Date;
}
