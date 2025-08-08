import {
    IsNotEmpty,
    IsString,
  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
  
export class UpdateWorkerDto {  
  @ApiProperty({
    description: 'Worker\'s RUT (Chilean ID)',
    example: '12345678-9',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly rut: string;

  @ApiProperty({
    description: 'Worker\'s bank account number',
    example: '1234567890',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly accountNumber: string;

  @ApiProperty({
    description: 'Worker\'s bank name',
    example: 'Banco Estado',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly bank: string;

  @ApiProperty({
    description: 'Worker\'s bank account type',
    example: 'Cuenta Corriente',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly accountType: string;
}
  