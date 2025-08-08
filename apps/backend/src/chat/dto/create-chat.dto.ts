import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// defines the shape of the data required
export class CreateChatDto {
  @ApiProperty({
    description: 'The ID of the chat room',
    example: '1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly chatRoomId: string;

  @ApiProperty({
    description: 'The ID of the message sender',
    example: '1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly senderId: string;

  @ApiProperty({
    description: 'The message text content',
    example: 'Hello, how are you?',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 1000)
  readonly text: string;
}
