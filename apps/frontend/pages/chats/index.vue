<template>
  <v-container fluid class="pa-0" style="height: calc(100vh - 64px);">
    <!-- Desktop Layout -->
    <v-row v-if="!isMobile" no-gutters style="height: 100%;">
      <!-- Chat Rooms List - Desktop -->
      <v-col cols="4" style="height: 100%; border-right: 1px solid #e0e0e0;">
        <v-card flat style="height: 100%;" class="d-flex flex-column">
          <!-- Header -->
          <v-card-title class="px-4 py-3 bg-primary text-white">
            <v-icon left class="mr-2">mdi-chat</v-icon>
            Conversaciones
          </v-card-title>
          
          <!-- Search Bar -->
          <v-card-text class="px-4 py-2">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              placeholder="Buscar conversaciones..."
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-card-text>
          
          <!-- Loading State -->
          <v-card-text v-if="chat.isLoadingRooms.value" class="pa-4 text-center">
            <v-progress-circular indeterminate color="primary" class="mb-2" />
            <div class="text-body-2">Cargando conversaciones...</div>
          </v-card-text>
          
          <!-- Error State -->
          <v-card-text v-else-if="chat.error.value" class="pa-4">
            <v-alert
              type="error"
              variant="tonal"
              :text="chat.error.value"
              class="mb-3"
            />
            <v-btn 
              @click="chat.loadChatRooms()"
              color="primary"
              variant="outlined"
              block
            >
              Reintentar
            </v-btn>
          </v-card-text>
          
          <!-- Chat Rooms List -->
          <v-card-text v-else class="pa-0 flex-grow-1" style="overflow-y: auto;">
            <v-list v-if="filteredChatRooms.length > 0" class="pa-0">
              <v-list-item
                v-for="chatRoom in filteredChatRooms"
                :key="chatRoom.id"
                @click="selectChatRoom(chatRoom)"
                :active="selectedChatRoom?.id === chatRoom.id"
                class="px-4 py-3"
                style="border-bottom: 1px solid #f5f5f5;"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary" size="48">
                    <v-icon color="white">mdi-account</v-icon>
                  </v-avatar>
                </template>
                
                <v-list-item-title class="font-weight-medium">
                  {{ chatRoom.participantName }}
                </v-list-item-title>
                
                <v-list-item-subtitle class="text-caption">
                  {{ chatRoom.jobTitle }}
                </v-list-item-subtitle>
                
                <v-list-item-subtitle class="mt-1">
                  {{ chatRoom.lastMessage || 'Sin mensajes' }}
                </v-list-item-subtitle>
                
                <template v-slot:append>
                  <div class="d-flex flex-column align-end">
                    <v-chip
                      v-if="chatRoom.unreadCount > 0"
                      color="error"
                      size="x-small"
                      class="mb-1"
                    >
                      {{ chatRoom.unreadCount }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">
                      {{ formatTime(chatRoom.lastMessageTime) }}
                    </span>
                  </div>
                </template>
              </v-list-item>
            </v-list>
            
            <!-- Empty State -->
            <v-card v-else flat class="d-flex flex-column align-center justify-center" style="height: 100%;">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-chat-outline</v-icon>
              <v-card-text class="text-center text-medium-emphasis">
                No tienes conversaciones aún
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Chat View - Desktop -->
      <v-col cols="8" style="height: 100%;">
        <ChatView :chatRoom="selectedChatRoom" />
      </v-col>
    </v-row>
    
    <!-- Mobile Layout -->
    <div v-else style="height: 100%;">
      <!-- Chat Rooms List - Mobile -->
      <v-card v-if="!selectedChatRoom" flat style="height: 100%;" class="d-flex flex-column">
        <!-- Header -->
        <v-app-bar color="primary" density="comfortable">
          <v-app-bar-title class="text-white">
            <v-icon left class="mr-2">mdi-chat</v-icon>
            Conversaciones
          </v-app-bar-title>
        </v-app-bar>
        
        <!-- Search Bar -->
        <v-card-text class="px-4 py-2">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            placeholder="Buscar conversaciones..."
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-card-text>
        
        <!-- Chat Rooms List -->
        <v-card-text class="pa-0 flex-grow-1" style="overflow-y: auto;">
          <v-list v-if="filteredChatRooms.length > 0" class="pa-0">
            <v-list-item
              v-for="chatRoom in filteredChatRooms"
              :key="chatRoom.id"
              @click="selectChatRoom(chatRoom)"
              class="px-4 py-3"
              style="border-bottom: 1px solid #f5f5f5;"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" size="48">
                  <v-icon color="white">mdi-account</v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="font-weight-medium">
                {{ chatRoom.participantName }}
              </v-list-item-title>
              
              <v-list-item-subtitle class="text-caption">
                {{ chatRoom.jobTitle }}
              </v-list-item-subtitle>
              
              <v-list-item-subtitle class="mt-1">
                {{ chatRoom.lastMessage || 'Sin mensajes' }}
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <div class="d-flex flex-column align-end">
                  <v-chip
                    v-if="chatRoom.unreadCount > 0"
                    color="error"
                    size="x-small"
                    class="mb-1"
                  >
                    {{ chatRoom.unreadCount }}
                  </v-chip>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatTime(chatRoom.lastMessageTime) }}
                  </span>
                </div>
              </template>
            </v-list-item>
          </v-list>
          
          <!-- Empty State -->
          <v-card v-else flat class="d-flex flex-column align-center justify-center" style="height: 100%;">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-chat-outline</v-icon>
            <v-card-text class="text-center text-medium-emphasis">
              No tienes conversaciones aún
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
      
      <!-- Chat View - Mobile -->
      <div v-else style="height: 100%;">
        <ChatView :chatRoom="selectedChatRoom" :isMobile="true" @back="goBackToList" />
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDisplay } from 'vuetify';
import ChatView from '@/components/chat/ChatView.vue';
import { useChat } from '@/composables/useChat';
import type { ChatRoomPreview } from '@/repositories/chatRepository';

// Vuetify composables
const { mobile } = useDisplay();
const isMobile = computed(() => mobile.value);

// Chat composable and stores
const userStore = useUserStore();
const chat = useChat();

// Types
interface ChatRoom {
  id: number;
  participantName: string;
  jobTitle: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  avatar?: string;
}

// Reactive state
const searchQuery = ref('');
const selectedChatRoom = ref<ChatRoom | null>(null);

// Transform chat rooms data
const transformedChatRooms = computed(() => {
  if (!chat || !userStore.isLoggedIn()) return [];
  
  return chat.chatRoomsList.value.map((room: ChatRoomPreview) => {
    const state = chat.getChatRoomState(room.id);
    const currentUserId = userStore.getId;
    
    const participantName = room.jobCreator.id === currentUserId 
      ? `${room.jobWorker.firstname} ${room.jobWorker.lastname}`
      : `${room.jobCreator.firstname} ${room.jobCreator.lastname}`;
    
    return {
      id: room.id,
      participantName,
      jobTitle: room.job.title,
      lastMessage: room.lastMessage?.text || '',
      lastMessageTime: room.lastMessage ? new Date(room.lastMessage.timestamp) : undefined,
      unreadCount: state.unreadCount,
      avatar: undefined
    };
  });
});

// Computed properties
const filteredChatRooms = computed(() => {
  if (!searchQuery.value) return transformedChatRooms.value;
  
  return transformedChatRooms.value.filter((chatRoom: ChatRoom) =>
    chatRoom.participantName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    chatRoom.jobTitle.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Methods
const selectChatRoom = async (chatRoom: ChatRoom) => {
  selectedChatRoom.value = chatRoom;
  
  // Join chat room via WebSocket and load messages
  await chat.joinChatRoom(chatRoom.id);
};

const goBackToList = async () => {
  if (selectedChatRoom.value) {
    await chat.leaveChatRoom(selectedChatRoom.value.id);
  }
  selectedChatRoom.value = null;
};

const formatTime = (date: Date | undefined) => {
  if (!date) return '';
  
  const now = new Date();
  const messageDate = new Date(date);
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 168) { // Less than a week
    return messageDate.toLocaleDateString('es-ES', { 
      weekday: 'short' 
    });
  } else {
    return messageDate.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }
};

// Meta
definePageMeta({
  middleware: 'auth'
});
</script>



