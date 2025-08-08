import {
  IsNotEmpty,
  IsString,
  Matches,
  IsEmail,
  MinLength,
  IsBoolean,
  IsBooleanString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User\'s first name',
    example: 'John',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly firstname: string;

  @ApiProperty({
    description: 'User\'s last name',
    example: 'Doe',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly lastname: string;

  @ApiProperty({
    description: 'User\'s email address',
    example: 'john.doe@example.com',
    type: 'string',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'User\'s password (minimum 8 characters)',
    example: 'password123',
    type: 'string',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;

  @ApiProperty({
    description: 'User\'s account status',
    example: true,
    type: 'boolean',
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly status: boolean;

  @ApiProperty({
    description: 'User\'s phone number',
    example: '+56912345678',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly phonenumber: string;

  @ApiProperty({
    description: 'User\'s RUT (Chilean ID)',
    example: '12345678-9',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly rut: string;

  @ApiProperty({
    description: 'User\'s bank account number',
    example: '1234567890',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly accountNumber: string;

  @ApiProperty({
    description: 'User\'s bank name',
    example: 'Banco Estado',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly bank: string;

  @ApiProperty({
    description: 'User\'s bank account type',
    example: 'Cuenta Corriente',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly accountType: string;
}
