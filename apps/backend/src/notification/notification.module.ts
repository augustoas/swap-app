import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { NotificationService } from './notification.service';
import { Notification } from '../database/entities/notification.entity'; // Import the Notification entity
import { NotificationController } from './notification.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [NotificationController],
  imports: [TypeOrmModule.forFeature([Notification]), AuthModule], // Register the Notification entity for use with TypeORM
  providers: [NotificationService], // Removed NotificationGateway
  exports: [NotificationService], // Export the NotificationService for use by WebSocket module
})
export class NotificationModule {}
