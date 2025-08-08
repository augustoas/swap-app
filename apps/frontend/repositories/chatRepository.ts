import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type Chat, type ChatRoom } from "@/types/resource";
import type { ApiResponse } from "@/types/api";

/**
 * Chat room preview interface for the initial load
 */
export interface ChatRoomPreview {
  id: number;
  job: {
    id: number;
    title: string;
    description: string;
  };
  jobCreator: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  jobWorker: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  lastMessage: {
    id: number;
    text: string;
    timestamp: Date;
    senderId: number;
    senderName: string;
  } | null;
  unreadCount: number;
  isActive: boolean;
  createdDate: Date;
  updatedDate: Date;
}

/**
 * Chat message interface for API responses
 */
export interface ChatMessage {
  id: number;
  text: string;
  createdDate: Date;
  sender: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  chatRoom: {
    id: number;
  };
}

/**
 * Pagination response for older messages
 */
export interface MessagePaginationResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  totalCount: number;
}

/**
 * Represents a repository for managing chat and chat room data.
 */
export default class ChatRepository extends RepositoryFactory<Chat> {
  /**
   * Creates a new ChatRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<Chat, NitroFetchRequest>) {
    super(Resource.Chat, fetch);
  }

  /**
   * Gets all chat rooms for the current user with preview information.
   * @returns A promise that resolves to the chat rooms with preview data.
   */
  async getMyChatRoomsPreview(): Promise<ApiResponse<ChatRoomPreview[]>> {
    try {
      const response = await this.fetch<ApiResponse<ChatRoomPreview[]>>(`chat-rooms/my-chats/preview`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error al cargar las conversaciones.', { cause: error });
    }
  }

  /**
   * Gets recent messages for a specific chat room.
   * @param chatRoomId - The ID of the chat room.
   * @param limit - Number of messages to retrieve (default: 50).
   * @returns A promise that resolves to the recent messages.
   */
  async getRecentMessages(chatRoomId: number, limit: number = 50): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const response = await this.fetch<ApiResponse<ChatMessage[]>>(`chat/room/${chatRoomId}/recent?limit=${limit}`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error al cargar los mensajes recientes.', { cause: error });
    }
  }

  /**
   * Gets older messages for pagination.
   * @param chatRoomId - The ID of the chat room.
   * @param messageId - Load messages sent before this message ID.
   * @param limit - Number of messages to retrieve (default: 20).
   * @returns A promise that resolves to the older messages with pagination info.
   */
  async getOlderMessages(chatRoomId: number, messageId: number, limit: number = 20): Promise<ApiResponse<MessagePaginationResponse>> {
    try {
      const response = await this.fetch<ApiResponse<MessagePaginationResponse>>(`chat/room/${chatRoomId}/before/${messageId}?limit=${limit}`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error al cargar mensajes anteriores.', { cause: error });
    }
  }

  /**
   * Sends a message via REST API (fallback method).
   * @param chatRoomId - The ID of the chat room.
   * @param senderId - The ID of the sender.
   * @param text - The message text.
   * @returns A promise that resolves when the message is sent.
   */
  async sendMessage(chatRoomId: number, senderId: number, text: string): Promise<ApiResponse<ChatMessage>> {
    try {
      const response = await this.fetch<ApiResponse<ChatMessage>>(`chat`, {
        method: 'POST',
        body: {
          chatRoomId,
          senderId,
          text
        }
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error al enviar el mensaje.', { cause: error });
    }
  }
} 