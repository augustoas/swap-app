import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// defines the shape of the data required for authentication
export class SignInDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    type: 'string',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

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
