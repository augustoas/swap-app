import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsNumberString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// defines the shape of the data required
export class CreateJobCategoryDto {
  @ApiProperty({
    description: 'The ID of the category',
    example: '1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly categoryId: string;

  @ApiProperty({
    description: 'The ID of the job',
    example: '1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly jobId: string;
}
