import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// defines the shape of the data required for authentication
export class ResetPasswordDto {
  @ApiPropertyOptional({
    description: 'The reset token received via email',
    example: 'valid-reset-token',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly resetToken: string;

  @ApiProperty({
    description: 'The new password for the user',
    example: 'newPassword123',
    type: 'string',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly newPassword: string;

  @ApiProperty({
    description: 'The confirmation of the new password',
    example: 'newPassword123',
    type: 'string',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly confirmPassword: string;
}
