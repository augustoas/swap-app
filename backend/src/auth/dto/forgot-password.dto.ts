import { IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'The email address of the user who forgot their password',
    example: 'user@example.com',
    type: 'string',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
} 