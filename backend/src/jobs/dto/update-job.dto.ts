import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Currency } from '../../types/Currency.enum';
import { DateType } from '../../types/DateType.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateJobDto {
  @ApiPropertyOptional({
    description: 'The budget for the job',
    example: '1000',
    type: 'string',
  })
  @IsOptional()
  @IsNumberString()
  budget: number;

  @ApiPropertyOptional({
    description: 'The accepted budget for the job',
    example: '900',
    type: 'string',
  })
  @IsOptional()
  @IsNumberString()
  accepted_budget: number;

  @ApiPropertyOptional({
    description: 'The description of the job',
    example: 'Need a web developer for a small project',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'The detailed description of the job',
    example: 'Looking for a web developer with experience in React and Node.js',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  details: string;

  @ApiPropertyOptional({
    description: 'The currency for the budget',
    enum: Currency,
    example: Currency.USD,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency: Currency;

  @ApiPropertyOptional({
    description: 'The region where the job is located',
    example: 'Metropolitan Region',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  region: string;

  @ApiPropertyOptional({
    description: 'The commune where the job is located',
    example: 'Santiago',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  commune: string;

  @ApiPropertyOptional({
    description: 'The specific address where the job is located',
    example: '123 Main St',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiPropertyOptional({
    description: 'The type of date for the job',
    enum: DateType,
  })
  @IsOptional()
  @IsEnum(DateType)
  dateType: DateType;

  @ApiPropertyOptional({
    description: 'The specific date for the job (if dateType is SPECIFIC)',
    example: '2024-03-20',
    type: 'string',
  })
  @IsOptional()
  @IsDateString()
  date: Date;

  @ApiPropertyOptional({
    description: 'Whether the job can be done remotely',
    example: true,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  is_remote: boolean;

  @ApiPropertyOptional({
    description: 'The number of views for the job',
    example: 10,
    type: 'number',
  })
  @IsOptional()
  @IsNumber()
  viewsCounter: number;
}
