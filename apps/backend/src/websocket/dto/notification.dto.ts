import { IsNotEmpty, IsString, IsNumberString, IsOptional } from 'class-validator';

export class JoinNotificationsDto {
  @IsNotEmpty()
  @IsNumberString()
  userId: string;
}

export class SendNotificationDto {
  @IsNotEmpty()
  @IsNumberString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export class NotificationReceivedDto {
  id: number;
  userId: number;
  title: string;
  message: string;
  type?: string;
  createdDate: Date;
} 