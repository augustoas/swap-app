import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// defines the shape of the data required for authentication
export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Electronics',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'The description of the category',
    example: 'Electronic devices and accessories',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly description: string;
}
