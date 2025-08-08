import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTycDto {
  @ApiProperty({
    description: 'The title of the terms and conditions',
    example: 'Terms of Service - Version 1.0',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty({
    description: 'The main text content of the terms and conditions',
    example: 'By using our service, you agree to these terms...',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly text: string;

  @ApiProperty({
    description: 'A detailed description of the terms and conditions',
    example: 'These terms and conditions outline the rules and regulations for the use of our service...',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly description: string;
}
