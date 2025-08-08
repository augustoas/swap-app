// src/notifications/notification.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity'; // Import the Notification entity
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '../database/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  // Create a new notification and save to database
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const { userId, path, ...notificationDto } = createNotificationDto;
    const notification = this.notificationRepository.create(notificationDto);
    notification.user = { id: userId } as User;
    notification.path = path;
    notification.is_read = false;
    const savedNotification = await this.notificationRepository.save(notification);

    return savedNotification;
  }

  // Remove a notification
  async remove(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async findByCurrentAuthUser(user: User): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: user.id } },
      order: { createdDate: 'DESC' },
    });
  }

  // Find a notification by ID with user relation
  async findOne(id: number): Promise<Notification | null> {
    return this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  // Mark notification as read
  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    if (notification) {
      notification.is_read = true;
      return this.notificationRepository.save(notification);
    }
    return null;
  }

  // Get unread notifications count for a user
  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { user: { id: userId }, is_read: false },
    });
  }
}
