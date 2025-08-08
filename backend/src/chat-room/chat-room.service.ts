import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateChatRoomDto, ChatRoomPreview } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from '../database/entities/chatRoom.entity';
import { Job } from '../database/entities/job.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
  ) {}

  async create(createChatRoomDto: CreateChatRoomDto): Promise<ChatRoom> {
    const { jobId, jobCreatorId, jobWorkerId, isActive = true } = createChatRoomDto;
    
    const newChatRoom = this.chatRoomRepository.create();
    newChatRoom.job = { id: +jobId } as Job;
    newChatRoom.jobCreator = { id: +jobCreatorId } as User;
    newChatRoom.jobWorker = { id: +jobWorkerId } as User;
    newChatRoom.isActive = isActive;

    return this.chatRoomRepository.save(newChatRoom);
  }

  async findAll(): Promise<Array<ChatRoom>> {
    return this.chatRoomRepository.find({
      relations: ['job', 'jobCreator', 'jobWorker'],
    });
  }

  async findOne(id: number): Promise<ChatRoom> {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: id },
      relations: ['job', 'jobCreator', 'jobWorker', 'chats'],
    });
    
    if (!chatRoom) {
      throw new NotFoundException(`Chat room with ID ${id} not found`);
    }
    
    return chatRoom;
  }

  async findByJobId(jobId: number): Promise<ChatRoom> {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { job: { id: jobId } },
      relations: ['job', 'jobCreator', 'jobWorker', 'chats'],
    });
    
    if (!chatRoom) {
      throw new NotFoundException(`Chat room for job ID ${jobId} not found`);
    }
    
    return chatRoom;
  }

  async findByUserId(userId: number): Promise<Array<ChatRoom>> {
    return this.chatRoomRepository.find({
      where: [
        { jobCreator: { id: userId } },
        { jobWorker: { id: userId } },
      ],
      relations: ['job', 'jobCreator', 'jobWorker'],
    });
  }

  /**
   * Find chat rooms by user ID with preview data (last message, unread count)
   * This method supports the hybrid loading approach
   */
  async findByUserIdWithPreview(userId: number): Promise<ChatRoomPreview[]> {
    const chatRooms = await this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .leftJoinAndSelect('chatRoom.job', 'job')
      .leftJoinAndSelect('chatRoom.jobCreator', 'jobCreator')
      .leftJoinAndSelect('chatRoom.jobWorker', 'jobWorker')
      .leftJoinAndSelect('chatRoom.chats', 'chat')
      .leftJoinAndSelect('chat.sender', 'sender')
      .where('chatRoom.jobCreator.id = :userId OR chatRoom.jobWorker.id = :userId', { userId })
      .orderBy('chatRoom.updatedDate', 'DESC')
      .addOrderBy('chat.createdDate', 'DESC')
      .getMany();

    // Transform to preview format
    return chatRooms.map(chatRoom => {
      // Get the last message (most recent)
      const lastMessage = chatRoom.chats && chatRoom.chats.length > 0 
        ? chatRoom.chats[0] 
        : null;

      // Count unread messages for the requesting user
      // Note: This is a simplified approach. In a real app, you'd track read status per user
      const unreadCount = chatRoom.chats 
        ? chatRoom.chats.filter(chat => 
            chat.sender.id !== userId && 
            chat.createdDate > (lastMessage?.createdDate || new Date())
          ).length 
        : 0;

      return {
        id: chatRoom.id,
        job: {
          id: chatRoom.job.id,
          title: chatRoom.job.description, // Using description as title for now
          description: chatRoom.job.details || chatRoom.job.description,
        },
        jobCreator: {
          id: chatRoom.jobCreator.id,
          firstname: chatRoom.jobCreator.firstname,
          lastname: chatRoom.jobCreator.lastname,
          email: chatRoom.jobCreator.email,
        },
        jobWorker: {
          id: chatRoom.jobWorker.id,
          firstname: chatRoom.jobWorker.firstname,
          lastname: chatRoom.jobWorker.lastname,
          email: chatRoom.jobWorker.email,
        },
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          text: lastMessage.text,
          timestamp: lastMessage.createdDate,
          senderId: lastMessage.sender.id,
          senderName: `${lastMessage.sender.firstname} ${lastMessage.sender.lastname}`,
        } : undefined,
        unreadCount,
        isActive: chatRoom.isActive,
        createdDate: chatRoom.createdDate,
        updatedDate: chatRoom.updatedDate,
      };
    });
  }

  async update(id: number, updateChatRoomDto: UpdateChatRoomDto): Promise<ChatRoom> {
    const chatRoom = await this.findOne(id);
    
    if (updateChatRoomDto.jobId) {
      chatRoom.job = { id: +updateChatRoomDto.jobId } as Job;
    }
    if (updateChatRoomDto.jobCreatorId) {
      chatRoom.jobCreator = { id: +updateChatRoomDto.jobCreatorId } as User;
    }
    if (updateChatRoomDto.jobWorkerId) {
      chatRoom.jobWorker = { id: +updateChatRoomDto.jobWorkerId } as User;
    }
    if (updateChatRoomDto.isActive !== undefined) {
      chatRoom.isActive = updateChatRoomDto.isActive;
    }
    
    await this.chatRoomRepository.update(id, chatRoom);
    return this.chatRoomRepository.findOne({
      where: { id: id },
      relations: ['job', 'jobCreator', 'jobWorker'],
    });
  }

  async remove(id: number): Promise<void> {
    const chatRoom = await this.findOne(id);
    await this.chatRoomRepository.delete(id);
  }

  /**
   * Validate if a user has access to a chat room
   */
  async validateUserAccess(chatRoomId: number, userId: number): Promise<boolean> {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
      relations: ['jobCreator', 'jobWorker'],
    });

    if (!chatRoom) {
      return false;
    }

    return chatRoom.jobCreator.id === userId || chatRoom.jobWorker.id === userId;
  }
}
