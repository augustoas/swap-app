import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'The title of the notification',
    example: 'New Job Created',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty({
    description: 'The subtitle of the notification',
    example: 'Status: Published',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly subtitle: string;

  @ApiProperty({
    description: 'The message content of the notification',
    example: 'A new job has been created successfully',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly message: string;

  @ApiProperty({
    description: 'The ID of the user who will receive the notification',
    example: 1,
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;

  @ApiProperty({
    description: 'The path where the notification will redirect when clicked',
    example: '/jobs/123',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly path: string;
}