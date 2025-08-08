import { ref, computed, onMounted, onUnmounted } from 'vue';
import WebSocketService from '@/sockets/websocket.service';
import ChatRepository from '@/repositories/chatRepository';
import type {
  WebSocketResponse,
  MessageReceivedDto,
  JoinChatRoomResponse,
  ChatHistoryResponse,
  ChatRoomInfo,
  UserJoinedRoom,
  UserLeftRoom,
  EventCallback
} from '@/types/websocket';
import type { ChatRoomPreview, ChatMessage as ApiChatMessage } from '@/repositories/chatRepository';

export interface UseChatOptions {
  autoJoinRooms?: number[];
  enableNotifications?: boolean;
}

export interface ChatMessageDto extends MessageReceivedDto {
  isOptimistic?: boolean;
  updatedDate?: Date;
}

export interface ChatRoomState {
  info?: ChatRoomInfo;
  messages: ChatMessageDto[];
  users: UserJoinedRoom[];
  isLoading: boolean;
  hasMore: boolean;
  lastMessageId?: number;
  participantName?: string;
  jobTitle?: string;
  unreadCount: number;
}

export function useChat(options: UseChatOptions = {}) {
  const { autoJoinRooms = [], enableNotifications = true } = options;

  // Repository and stores
  const { $api } = useNuxtApp();
  const chatRepository = new ChatRepository($api);
  const userStore = useUserStore();

  // Reactive state
  const isConnected = computed(() => WebSocketService.connected);
  const joinedChatRooms = computed(() => WebSocketService.joinedChatRooms.value);
  const currentUser = computed(() => WebSocketService.currentUser.value);
  
  // Chat room states
  const chatRooms = ref<Map<number, ChatRoomState>>(new Map());
  const chatRoomsList = ref<ChatRoomPreview[]>([]);
  const activeChatRoom = ref<number | null>(null);
  const isJoining = ref(false);
  const isLeaving = ref(false);
  const isSending = ref(false);
  const isLoadingRooms = ref(false);
  const error = ref('');

  // Helper methods
  const getChatRoomState = (chatRoomId: number): ChatRoomState => {
    if (!chatRooms.value.has(chatRoomId)) {
      chatRooms.value.set(chatRoomId, {
        messages: [],
        users: [],
        isLoading: false,
        hasMore: true,
        unreadCount: 0
      });
    }
    return chatRooms.value.get(chatRoomId)!;
  };

  const updateChatRoomState = (chatRoomId: number, updates: Partial<ChatRoomState>): void => {
    const state = getChatRoomState(chatRoomId);
    chatRooms.value.set(chatRoomId, { ...state, ...updates });
  };

    // Chat room loading
  const loadChatRooms = async (): Promise<void> => {
    if (isLoadingRooms.value) return;
    
    isLoadingRooms.value = true;
    error.value = '';
    
    try {
      const response = await chatRepository.getMyChatRoomsPreview();
      
      if (response.payload) {
        chatRoomsList.value = response.payload;
        
        // Initialize chat room states
        response.payload.forEach(room => {
          const currentUserId = userStore.getId;
          const participantName = room.jobCreator.id === currentUserId 
            ? `${room.jobWorker.firstname} ${room.jobWorker.lastname}`
            : `${room.jobCreator.firstname} ${room.jobCreator.lastname}`;
          
          updateChatRoomState(room.id, {
            participantName,
            jobTitle: room.job.title,
            unreadCount: room.unreadCount
          });
        });
      }
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
      error.value = err instanceof Error ? err.message : 'Error al cargar las conversaciones';
    } finally {
      isLoadingRooms.value = false;
    }
  };

  // Chat room methods
  const joinChatRoom = async (chatRoomId: number): Promise<boolean> => {
    if (!isConnected.value) {
      console.error('WebSocket not connected');
      return false;
    }

    if (joinedChatRooms.value.has(chatRoomId)) {
      console.log('Already in chat room:', chatRoomId);
      activeChatRoom.value = chatRoomId;
      return true;
    }

    isJoining.value = true;
    updateChatRoomState(chatRoomId, { isLoading: true });

    try {
      // Join via WebSocket
      await WebSocketService.joinChatRoom(chatRoomId);
      
      // Load recent messages via API
      await loadRecentMessages(chatRoomId);
      
      // Set as active room
      activeChatRoom.value = chatRoomId;
      
      // Mark as read
      updateChatRoomState(chatRoomId, { unreadCount: 0 });
      
      return true;
    } catch (error) {
      console.error('Failed to join chat room:', error);
      updateChatRoomState(chatRoomId, { isLoading: false });
      return false;
    } finally {
      isJoining.value = false;
    }
  };

  const leaveChatRoom = async (chatRoomId: number): Promise<boolean> => {
    if (!isConnected.value) {
      console.error('WebSocket not connected');
      return false;
    }

    isLeaving.value = true;

    try {
      await WebSocketService.leaveChatRoom(chatRoomId);
      
      if (activeChatRoom.value === chatRoomId) {
        activeChatRoom.value = null;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to leave chat room:', error);
      return false;
    } finally {
      isLeaving.value = false;
    }
  };

  const sendMessage = async (chatRoomId: number, text: string): Promise<boolean> => {
    if (!text.trim()) {
      console.error('Message text cannot be empty');
      return false;
    }

    isSending.value = true;
    const currentUserId = userStore.getId;
    const currentUserName = `${userStore.getFirstname} ${userStore.getLastname}`;

    // Add optimistic message
    const optimisticMessage: ChatMessageDto = {
      id: Date.now(),
      text: text.trim(),
      createdDate: new Date(),
      updatedDate: new Date(),
      chatRoomId,
      senderId: currentUserId,
      senderName: currentUserName,
      isOptimistic: true
    };

    // Add to local state immediately
    addMessage(optimisticMessage);

    try {
      if (isConnected.value) {
        // Send via WebSocket
        await WebSocketService.sendMessage(chatRoomId, text.trim());
      } else {
        // Fallback to REST API
        const response = await chatRepository.sendMessage(chatRoomId, currentUserId, text.trim());
        
        if (response.payload) {
          // Remove optimistic message and add real message
          const state = getChatRoomState(chatRoomId);
          const messages = state.messages.filter(msg => !msg.isOptimistic);
          messages.push({
            id: response.payload.id,
            text: response.payload.text,
            createdDate: new Date(response.payload.createdDate),
            updatedDate: new Date(response.payload.createdDate),
            chatRoomId: response.payload.chatRoom.id,
            senderId: response.payload.sender.id,
            senderName: `${response.payload.sender.firstname} ${response.payload.sender.lastname}`
          });
          
          updateChatRoomState(chatRoomId, { messages });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove optimistic message on error
      const state = getChatRoomState(chatRoomId);
      const messages = state.messages.filter(msg => !msg.isOptimistic);
      updateChatRoomState(chatRoomId, { messages });
      
      return false;
    } finally {
      isSending.value = false;
    }
  };

  const loadRecentMessages = async (chatRoomId: number): Promise<void> => {
    updateChatRoomState(chatRoomId, { isLoading: true });

    try {
      const response = await chatRepository.getRecentMessages(chatRoomId, 50);
      
      if (response.payload) {
        const messages = response.payload.map(msg => ({
          id: msg.id,
          text: msg.text,
          createdDate: new Date(msg.createdDate),
          updatedDate: new Date(msg.createdDate),
          chatRoomId: msg.chatRoom.id,
          senderId: msg.sender.id,
          senderName: `${msg.sender.firstname} ${msg.sender.lastname}`
        }));
        
        updateChatRoomState(chatRoomId, {
          messages,
          hasMore: response.payload.length >= 50,
          lastMessageId: response.payload.length > 0 ? response.payload[0].id : undefined
        });
      }
    } catch (error) {
      console.error('Failed to load recent messages:', error);
    } finally {
      updateChatRoomState(chatRoomId, { isLoading: false });
    }
  };

  const loadMoreMessages = async (chatRoomId: number): Promise<void> => {
    const state = getChatRoomState(chatRoomId);
    
    if (!state.hasMore || state.isLoading || !state.lastMessageId) {
      return;
    }

    updateChatRoomState(chatRoomId, { isLoading: true });

    try {
      const response = await chatRepository.getOlderMessages(chatRoomId, state.lastMessageId, 20);
      
      if (response.payload) {
        const olderMessages = response.payload.messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          createdDate: new Date(msg.createdDate),
          updatedDate: new Date(msg.createdDate),
          chatRoomId: msg.chatRoom.id,
          senderId: msg.sender.id,
          senderName: `${msg.sender.firstname} ${msg.sender.lastname}`
        }));
        
        // Prepend older messages
        const currentMessages = state.messages.filter(msg => !msg.isOptimistic);
        const allMessages = [...olderMessages, ...currentMessages];
        
        updateChatRoomState(chatRoomId, {
          messages: allMessages,
          hasMore: response.payload.hasMore,
          lastMessageId: olderMessages.length > 0 ? olderMessages[0].id : state.lastMessageId
        });
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      updateChatRoomState(chatRoomId, { isLoading: false });
    }
  };

  const getChatHistory = async (chatRoomId: number): Promise<void> => {
    // Use loadRecentMessages instead of WebSocket getChatHistory
    await loadRecentMessages(chatRoomId);
  };

  const setActiveChatRoom = (chatRoomId: number | null): void => {
    activeChatRoom.value = chatRoomId;
    
    // Mark as read when setting active
    if (chatRoomId) {
      updateChatRoomState(chatRoomId, { unreadCount: 0 });
    }
  };

  // Message management
  const addMessage = (message: ChatMessageDto): void => {
    const state = getChatRoomState(message.chatRoomId);
    
    // Check if message already exists (avoid duplicates)
    const exists = state.messages.some(m => m.id === message.id && !m.isOptimistic);
    if (!exists) {
      // Remove optimistic message if it exists
      const messages = state.messages.filter(m => 
        !(m.isOptimistic && m.text === message.text && m.senderId === message.senderId)
      );
      
      // Add new message
      messages.push(message);
      
      // Sort by creation date
      const sortedMessages = messages.sort((a, b) => 
        new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
      );
      
      updateChatRoomState(message.chatRoomId, {
        messages: sortedMessages,
        lastMessageId: message.id
      });
    }
  };

  const addUserToRoom = (data: UserJoinedRoom): void => {
    const state = getChatRoomState(data.chatRoomId);
    
    // Check if user already exists
    const exists = state.users.some(u => u.userId === data.userId);
    if (!exists) {
      updateChatRoomState(data.chatRoomId, {
        users: [...state.users, data]
      });
    }
  };

  const removeUserFromRoom = (data: UserLeftRoom): void => {
    const state = getChatRoomState(data.chatRoomId);
    
    updateChatRoomState(data.chatRoomId, {
      users: state.users.filter(u => u.userId !== data.userId)
    });
  };

  // Event handlers
  const handleMessageReceived = (message: MessageReceivedDto): void => {
    // Convert to ChatMessageDto
    const chatMessage: ChatMessageDto = {
      ...message,
      updatedDate: new Date(message.createdDate)
    };
    
    addMessage(chatMessage);
    
    // Update unread count if not in active room
    if (activeChatRoom.value !== message.chatRoomId) {
      const state = getChatRoomState(message.chatRoomId);
      updateChatRoomState(message.chatRoomId, { 
        unreadCount: state.unreadCount + 1 
      });
    }
  };

  const handleUserJoinedRoom = (data: UserJoinedRoom): void => {
    addUserToRoom(data);
  };

  const handleUserLeftRoom = (data: UserLeftRoom): void => {
    removeUserFromRoom(data);
  };

  const handleJoinChatRoomResponse = (response: WebSocketResponse<JoinChatRoomResponse>): void => {
    if (response.success && response.data) {
      const { chatRoomId } = response.data;
      
      console.log('Successfully joined chat room:', chatRoomId);
      
      // Update local state
      updateChatRoomState(chatRoomId, {
        isLoading: false
      });
      
      // Load recent messages if not already loaded
      const state = getChatRoomState(chatRoomId);
      if (state.messages.length === 0) {
        loadRecentMessages(chatRoomId);
      }
      
    } else {
      console.error('Failed to join chat room:', response.error);
      
      // Handle error state
      if (response.data?.chatRoomId) {
        updateChatRoomState(response.data.chatRoomId, {
          isLoading: false
        });
      }
    }
  };

  const handleLeaveChatRoomResponse = (response: WebSocketResponse): void => {
    if (response.success) {
      console.log('Successfully left chat room');
    } else {
      console.error('Failed to leave chat room:', response.error);
    }
  };

  const handleSendMessageResponse = (response: WebSocketResponse<MessageReceivedDto>): void => {
    if (response.success && response.data) {
      console.log('Message sent successfully:', response.data);
      // The message will be handled by handleMessageReceived
    } else {
      console.error('Failed to send message:', response.error);
    }
  };

  const handleChatHistoryResponse = (response: WebSocketResponse<ChatHistoryResponse>): void => {
    if (response.success && response.data) {
      const { chatRoomId, messages } = response.data;
      
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        createdDate: new Date(msg.createdDate),
        updatedDate: new Date(msg.createdDate),
        chatRoomId: msg.chatRoomId,
        senderId: msg.senderId,
        senderName: msg.senderName
      }));
      
      updateChatRoomState(chatRoomId, {
        messages: formattedMessages,
        isLoading: false,
        lastMessageId: formattedMessages.length > 0 ? formattedMessages[formattedMessages.length - 1].id : undefined
      });
    } else {
      console.error('Failed to get chat history:', response.error);
    }
  };

  // Event management
  const setupEventListeners = (): void => {
    WebSocketService.on('chat:message', handleMessageReceived);
    WebSocketService.on('chat:user_joined', handleUserJoinedRoom);
    WebSocketService.on('chat:user_left', handleUserLeftRoom);
    WebSocketService.on('chat:join_room_response', handleJoinChatRoomResponse);
    WebSocketService.on('chat:leave_room_response', handleLeaveChatRoomResponse);
    WebSocketService.on('chat:send_message_response', handleSendMessageResponse);
    WebSocketService.on('chat:history_response', handleChatHistoryResponse);
  };

  const cleanupEventListeners = (): void => {
    WebSocketService.off('chat:message', handleMessageReceived);
    WebSocketService.off('chat:user_joined', handleUserJoinedRoom);
    WebSocketService.off('chat:user_left', handleUserLeftRoom);
    WebSocketService.off('chat:join_room_response', handleJoinChatRoomResponse);
    WebSocketService.off('chat:leave_room_response', handleLeaveChatRoomResponse);
    WebSocketService.off('chat:send_message_response', handleSendMessageResponse);
    WebSocketService.off('chat:history_response', handleChatHistoryResponse);
  };

  // Auto-join rooms on mount
  const autoJoinChatRooms = async (): Promise<void> => {
    if (autoJoinRooms.length > 0) {
      for (const roomId of autoJoinRooms) {
        await joinChatRoom(roomId);
      }
    }
  };

  // Computed getters
  const getChatRoomMessages = (chatRoomId: number): ChatMessageDto[] => {
    return getChatRoomState(chatRoomId).messages;
  };

  const getChatRoomUsers = (chatRoomId: number): UserJoinedRoom[] => {
    return getChatRoomState(chatRoomId).users;
  };

  const getChatRoomInfo = (chatRoomId: number): ChatRoomInfo | undefined => {
    return getChatRoomState(chatRoomId).info;
  };

  const getActiveChatRoomState = computed(() => {
    return activeChatRoom.value ? getChatRoomState(activeChatRoom.value) : null;
  });

  // Lifecycle hooks
  onMounted(() => {
    setupEventListeners();
    loadChatRooms();
    autoJoinChatRooms();
  });

  onUnmounted(() => {
    cleanupEventListeners();
  });

  return {
    // State
    isConnected,
    joinedChatRooms,
    currentUser,
    chatRooms: computed(() => chatRooms.value),
    chatRoomsList: computed(() => chatRoomsList.value),
    activeChatRoom: computed(() => activeChatRoom.value),
    getActiveChatRoomState,
    isJoining: computed(() => isJoining.value),
    isLeaving: computed(() => isLeaving.value),
    isSending: computed(() => isSending.value),
    isLoadingRooms: computed(() => isLoadingRooms.value),
    error: computed(() => error.value),

    // Methods
    loadChatRooms,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    getChatHistory,
    loadMoreMessages,
    setActiveChatRoom,
    clearError: () => { error.value = ''; },

    // Getters
    getChatRoomMessages,
    getChatRoomUsers,
    getChatRoomInfo,
    getChatRoomState
  };
} 