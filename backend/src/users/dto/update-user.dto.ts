import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { Gender } from '../../types/Gender.enum';
import { ApiProperty } from '@nestjs/swagger';

// defines the shape of the data required for authentication
export class UpdateUserDto {
  @ApiProperty({
    description: 'User\'s username',
    example: 'johndoe',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @ApiProperty({
    description: 'User\'s email address',
    example: 'john.doe@example.com',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'User\'s gender',
    enum: Gender,
    example: Gender.MALE,
    required: false,
  })
  @IsEnum(Gender)
  @IsOptional()
  readonly gender: Gender;

  @ApiProperty({
    description: 'User\'s birth date',
    example: '1990-01-01',
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  readonly birthdate: Date;

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
