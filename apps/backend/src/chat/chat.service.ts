import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../database/entities/chat.entity';
import { ChatRoom } from '../database/entities/chatRoom.entity';
import { User } from '../database/entities/user.entity';

export interface PaginationOptions {
  limit?: number;
  before?: number; // Message ID to get messages before
  after?: number;  // Message ID to get messages after
}

export interface PaginatedMessages {
  messages: Chat[];
  hasMore: boolean;
  totalCount: number;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async create(createChatDto: CreateChatDto): Promise<Chat> {
    const { chatRoomId, senderId, text } = createChatDto;
    
    const newChat = this.chatRepository.create();
    newChat.chatRoom = { id: +chatRoomId } as ChatRoom;
    newChat.sender = { id: +senderId } as User;
    newChat.text = text;

    return this.chatRepository.save(newChat);
  }

  async findAll(): Promise<Array<Chat>> {
    return this.chatRepository.find({
      relations: ['chatRoom', 'sender'],
      order: { createdDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: id },
      relations: ['chatRoom', 'sender'],
    });
    
    if (!chat) {
      throw new NotFoundException(`Chat message with ID ${id} not found`);
    }
    
    return chat;
  }

  async findByChatRoomId(chatRoomId: number): Promise<Array<Chat>> {
    return this.chatRepository.find({
      where: { chatRoom: { id: chatRoomId } },
      relations: ['sender'],
      order: { createdDate: 'ASC' },
    });
  }

  async findBySenderId(senderId: number): Promise<Array<Chat>> {
    return this.chatRepository.find({
      where: { sender: { id: senderId } },
      relations: ['chatRoom', 'sender'],
      order: { createdDate: 'DESC' },
    });
  }

  async update(id: number, updateChatDto: UpdateChatDto): Promise<Chat> {
    const chat = await this.findOne(id);
    
    if (updateChatDto.chatRoomId) {
      chat.chatRoom = { id: +updateChatDto.chatRoomId } as ChatRoom;
    }
    if (updateChatDto.senderId) {
      chat.sender = { id: +updateChatDto.senderId } as User;
    }
    if (updateChatDto.text) {
      chat.text = updateChatDto.text;
    }
    
    await this.chatRepository.update(id, chat);
    return this.chatRepository.findOne({
      where: { id: id },
      relations: ['chatRoom', 'sender'],
    });
  }

  async remove(id: number): Promise<void> {
    const chat = await this.findOne(id);
    await this.chatRepository.delete(id);
  }

  /**
   * Find messages by chat room ID with pagination support
   * This method supports the hybrid loading approach
   */
  async findByChatRoomIdWithPagination(
    chatRoomId: number, 
    options: PaginationOptions = {}
  ): Promise<PaginatedMessages> {
    const { limit = 50, before, after } = options;

    let query = this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.sender', 'sender')
      .leftJoinAndSelect('chat.chatRoom', 'chatRoom')
      .where('chat.chatRoom.id = :chatRoomId', { chatRoomId });

    // Add pagination conditions
    if (before) {
      query = query.andWhere('chat.id < :before', { before });
    }
    if (after) {
      query = query.andWhere('chat.id > :after', { after });
    }

    // Order by creation date (newest first for loading older messages)
    query = query
      .orderBy('chat.createdDate', before ? 'DESC' : 'ASC')
      .limit(limit + 1); // Get one extra to check if there are more

    const messages = await query.getMany();
    
    // Check if there are more messages
    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop(); // Remove the extra message
    }

    // If we were getting messages before a certain point, reverse the order
    if (before) {
      messages.reverse();
    }

    // Get total count for the chat room
    const totalCount = await this.chatRepository.count({
      where: { chatRoom: { id: chatRoomId } },
    });

    return {
      messages,
      hasMore,
      totalCount,
    };
  }

  /**
   * Get recent messages for a chat room (most recent first)
   */
  async getRecentMessages(chatRoomId: number, limit: number = 50): Promise<Chat[]> {
    const result = await this.findByChatRoomIdWithPagination(chatRoomId, { limit });
    return result.messages.reverse(); // Return in chronological order (oldest first)
  }

  /**
   * Get older messages before a specific message ID
   */
  async getOlderMessages(chatRoomId: number, beforeMessageId: number, limit: number = 20): Promise<PaginatedMessages> {
    return await this.findByChatRoomIdWithPagination(chatRoomId, { 
      limit, 
      before: beforeMessageId 
    });
  }

  /**
   * Get newer messages after a specific message ID
   */
  async getNewerMessages(chatRoomId: number, afterMessageId: number, limit: number = 20): Promise<PaginatedMessages> {
    return await this.findByChatRoomIdWithPagination(chatRoomId, { 
      limit, 
      after: afterMessageId 
    });
  }

  /**
   * Get message count for a chat room
   */
  async getMessageCount(chatRoomId: number): Promise<number> {
    return await this.chatRepository.count({
      where: { chatRoom: { id: chatRoomId } },
    });
  }

  /**
   * Get the last message in a chat room
   */
  async getLastMessage(chatRoomId: number): Promise<Chat | null> {
    return await this.chatRepository.findOne({
      where: { chatRoom: { id: chatRoomId } },
      relations: ['sender'],
      order: { createdDate: 'DESC' },
    });
  }
}
