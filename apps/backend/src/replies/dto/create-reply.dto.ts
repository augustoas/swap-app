import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumberString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// defines the shape of the data required
export class CreateReplyDto {
  @ApiProperty({
    description: 'The text content of the reply',
    example: 'The project timeline is estimated to be 2 weeks.',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly text: string;

  @ApiProperty({
    description: 'The ID of the question this reply is for',
    example: '1',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  readonly questionId: string;
}
