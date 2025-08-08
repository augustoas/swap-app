import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// defines the shape of the data required for authentication
export class SignUpDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly firstname: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly lastname: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    type: 'string',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiPropertyOptional({
    description: 'The phone number of the user',
    example: '+1234567890',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  readonly phonenumber: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
    type: 'string',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
