import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsNumberString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// defines the shape of the data required
export class CreateReviewDto {
  @ApiProperty({
    description: 'The text content of the review',
    example: 'Great work! Very professional and delivered on time.',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly text: string;

  @ApiProperty({
    description: 'The rating given in the review (1-5)',
    example: '5',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly rating: string;

  @ApiProperty({
    description: 'The ID of the user receiving the review',
    example: '1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly reviewReceiverId: string;

  @ApiProperty({
    description: 'The ID of the job this review is for',
    example: '1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly jobId: string;
}
