import { IsNotEmpty, IsNumberString, IsOptional, ValidateNested, IsString, IsEnum, IsArray, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';
import { Currency } from '../../types/Currency.enum';
import { DateType } from '../../types/DateType.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({
    description: 'The budget for the job',
    example: 1000,
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumberString()
  readonly budget: number;

  @ApiPropertyOptional({
    description: 'The accepted budget for the job',
    example: 900,
    type: 'number',
  })
  @IsOptional()
  @IsNumberString()
  readonly accepted_budget: number | null;

  @ApiProperty({
    description: 'The description of the job',
    example: 'Need a web developer for a small project',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @ApiProperty({
    description: 'The detailed description of the job',
    example: 'Looking for a web developer with experience in React and Node.js',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly details: string;

  @ApiPropertyOptional({
    description: 'The currency for the budget',
    enum: Currency,
    example: Currency.USD,
  })
  @IsOptional()
  @IsEnum(Currency)
  readonly currency: Currency;

  @ApiPropertyOptional({
    description: 'The region where the job is located',
    example: 'Metropolitan Region',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  readonly region: string;

  @ApiPropertyOptional({
    description: 'The commune where the job is located',
    example: 'Santiago',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  readonly commune: string;

  @ApiPropertyOptional({
    description: 'The specific address where the job is located',
    example: '123 Main St',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  readonly address: string;

  @ApiPropertyOptional({
    description: 'Array of category IDs for the job',
    type: 'array',
    items: {
      type: 'string',
    },
    example: ['1', '2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly categories?: string[];

  @ApiProperty({
    description: 'The type of date for the job',
    enum: DateType,
  })
  @IsNotEmpty()
  @IsEnum(DateType)
  readonly dateType: DateType;

  @ApiPropertyOptional({
    description: 'The specific date for the job (if dateType is SPECIFIC)',
    example: '2024-03-20',
    type: 'string',
    nullable: true,
  })
  @IsOptional()
  readonly date: string | null;

  @ApiProperty({
    description: 'Whether the job can be done remotely',
    example: true,
    type: 'boolean',
  })
  @IsNotEmpty()
  @IsBooleanString()
  readonly is_remote: boolean;
}