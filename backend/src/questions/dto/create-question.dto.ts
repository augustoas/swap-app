import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsNumberString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// defines the shape of the data required
export class CreateQuestionDto {
  @ApiProperty({
    description: 'The text content of the question',
    example: 'What is the expected timeline for this project?',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly text: string;

  @ApiProperty({
    description: 'The ID of the job this question is for',
    example: '1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly jobId: string;
}
