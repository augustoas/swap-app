import {
  IsNotEmpty,
  IsString,
  IsNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// defines the shape of the data required
export class CreateOfferDto {
  @ApiProperty({
    description: 'The text content of the offer',
    example: 'I can help you with this job. I have 5 years of experience in this field.',
    type: 'string',
  })
  @IsString()
  readonly text: string;

  @ApiProperty({
    description: 'The budget amount for the offer',
    example: 1000,
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly budget: number;

  @ApiProperty({
    description: 'The ID of the job this offer is for',
    example: 1,
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly jobId: number;
}
