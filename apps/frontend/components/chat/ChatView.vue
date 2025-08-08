<template>
  <v-card flat style="height: 100%;" class="d-flex flex-column">
    <!-- Chat Header -->
    <v-card-title v-if="chatRoom" class="px-4 py-3 bg-primary text-white d-flex align-center">
      <!-- Back button for mobile -->
      <v-btn 
        v-if="isMobile" 
        @click="$emit('back')" 
        icon="mdi-arrow-left" 
        variant="text" 
        color="white"
        class="mr-2"
      />
      
      <v-avatar color="white" size="40" class="mr-3">
        <v-icon color="primary">mdi-account</v-icon>
      </v-avatar>
      
      <div class="d-flex flex-column">
        <span class="font-weight-medium">{{ chatRoom.participantName }}</span>
        <span class="text-caption opacity-90">{{ chatRoom.jobTitle }}</span>
      </div>
      
      <!-- Chat Actions -->
      <v-spacer />
      <v-btn icon="mdi-dots-vertical" variant="text" color="white" />
    </v-card-title>
    
    <!-- Empty State - No Chat Selected -->
    <v-card v-if="!chatRoom" flat class="d-flex flex-column align-center justify-center flex-grow-1">
      <v-icon size="80" color="grey-lighten-1" class="mb-4">mdi-chat-outline</v-icon>
      <v-card-text class="text-center text-medium-emphasis">
        <div class="text-h6 mb-2">Selecciona un chat para conversar</div>
        <div class="text-body-2">
          Elige una conversación de la lista para comenzar a chatear
        </div>
      </v-card-text>
    </v-card>
    
    <!-- Chat Content -->
    <template v-if="chatRoom">
      <!-- Connection Error Banner -->
      <v-alert
        v-if="connectionError"
        type="warning"
        variant="tonal"
        density="compact"
        class="ma-2"
        text="Conexión perdida. Reintentando..."
        closable
        @click:close="connectionError = false"
      />
      
      <!-- Messages Area -->
      <v-card-text 
        ref="messagesContainer"
        class="pa-0 flex-grow-1" 
        style="overflow-y: auto;"
        @scroll="handleScroll"
      >
        <v-container class="py-4">
          <!-- Loading Older Messages -->
          <v-row v-if="isLoadingOlderMessages" justify="center" class="mb-4">
            <v-col cols="auto">
              <v-progress-circular indeterminate color="primary" size="20" />
              <span class="text-caption text-medium-emphasis ml-2">Cargando mensajes anteriores...</span>
            </v-col>
          </v-row>
          
          <!-- Date Divider -->
          <v-row justify="center" class="mb-4">
            <v-col cols="auto">
              <v-chip size="small" color="grey-lighten-3" class="text-caption">
                {{ formatChatDate(new Date()) }}
              </v-chip>
            </v-col>
          </v-row>
          
                     <!-- Messages -->
           <div v-for="message in messages" :key="message.id" class="mb-3">
            <v-row :justify="message.isSent ? 'end' : 'start'">
              <v-col cols="auto" style="max-width: 70%;">
                <v-card
                  :color="message.isSent ? 'primary' : 'grey-lighten-4'"
                  :class="message.isSent ? 'text-white' : 'text-black'"
                  class="pa-3"
                  :style="message.isSent ? 'border-radius: 18px 18px 4px 18px;' : 'border-radius: 18px 18px 18px 4px;'"
                  elevation="0"
                >
                  <v-card-text class="pa-0">
                    <div class="text-body-2 mb-1">{{ message.text }}</div>
                    <div 
                      :class="message.isSent ? 'text-white' : 'text-medium-emphasis'"
                      class="text-caption d-flex align-center justify-end"
                    >
                      {{ formatMessageTime(message.timestamp) }}
                      <v-icon 
                        v-if="message.isSent" 
                        size="16" 
                        :color="message.read ? 'blue-lighten-2' : 'white'"
                        class="ml-1"
                      >
                        mdi-check-all
                      </v-icon>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
          
          <!-- Typing Indicator -->
          <v-row v-if="isTyping" justify="start" class="mb-3">
            <v-col cols="auto">
              <v-card color="grey-lighten-4" class="pa-3" style="border-radius: 18px 18px 18px 4px;" elevation="0">
                <div class="d-flex align-center">
                  <v-progress-circular
                    indeterminate
                    size="16"
                    width="2"
                    color="grey"
                    class="mr-2"
                  />
                  <span class="text-caption text-medium-emphasis">Escribiendo...</span>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      
            <!-- Message Input -->
      <v-divider />
      
      <!-- Sending Error Alert -->
      <v-alert
        v-if="sendingError"
        type="error"
        variant="tonal"
        density="compact"
        class="ma-2"
        :text="sendingError"
        closable
        @click:close="sendingError = ''"
      />
      
      <v-card-actions class="pa-4">
        <v-row no-gutters align="center">
          <v-col>
            <v-text-field
              v-model="newMessage"
              placeholder="Escribe un mensaje..."
              variant="outlined"
              density="compact"
              hide-details
              @keyup.enter="sendMessage"
              :disabled="!chat.isConnected.value"
              class="mr-2"
            />
          </v-col>
          <v-col cols="auto">
            <v-btn
              @click="sendMessage"
              :disabled="!newMessage.trim() || !chat.isConnected.value || chat.isSending.value"
              :loading="chat.isSending.value"
              color="primary"
              icon="mdi-send"
              variant="flat"
              size="large"
            />
          </v-col>
        </v-row>
        
        <!-- Connection Status -->
        <v-row v-if="!chat.isConnected.value" no-gutters class="mt-2">
          <v-col>
            <div class="text-caption text-center text-warning">
              <v-icon size="16" class="mr-1">mdi-wifi-off</v-icon>
              Sin conexión - los mensajes se enviarán cuando se restablezca
            </div>
          </v-col>
        </v-row>
      </v-card-actions>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useChat } from '@/composables/useChat';
import type { ChatMessageDto } from '@/composables/useChat';

// Props
interface ChatRoom {
  id: number;
  participantName: string;
  jobTitle: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  avatar?: string;
}

interface Props {
  chatRoom: ChatRoom | null;
  isMobile?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false
});

// Emits
const emit = defineEmits<{
  back: [];
}>();

// Chat composable and stores
const chat = useChat();
const userStore = useUserStore();

// Reactive state
const newMessage = ref('');
const isTyping = ref(false);
const messagesContainer = ref<HTMLElement>();
const isLoadingOlderMessages = ref(false);
const connectionError = ref(false);
const sendingError = ref('');

// Messages from chat composable
const messages = computed(() => {
  if (!props.chatRoom || !userStore.isLoggedIn()) return [];
  return chat.getChatRoomMessages(props.chatRoom.id).map((msg: ChatMessageDto) => ({
    id: msg.id,
    text: msg.text,
    timestamp: new Date(msg.createdDate),
    isSent: msg.senderId === userStore.getId,
    read: true // Assume all messages are read for now
  }));
});

// Loading state
const isLoadingMessages = computed(() => {
  if (!props.chatRoom) return false;
  const roomState = chat.getChatRoomState(props.chatRoom.id);
  return roomState.isLoading;
});

// Check if more messages are available
const hasMoreMessages = computed(() => {
  if (!props.chatRoom) return false;
  const roomState = chat.getChatRoomState(props.chatRoom.id);
  return roomState.hasMore;
});

// Methods
const sendMessage = async () => {
  if (!newMessage.value.trim() || !props.chatRoom) return;
  
  const messageText = newMessage.value.trim();
  newMessage.value = '';
  sendingError.value = '';
  
  try {
    const success = await chat.sendMessage(props.chatRoom.id, messageText);
    if (!success) {
      throw new Error('No se pudo enviar el mensaje');
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    // Restore message text on error
    newMessage.value = messageText;
    
    // Show user-friendly error message
    if (error instanceof Error) {
      sendingError.value = error.message;
    } else {
      sendingError.value = 'Error al enviar el mensaje. Inténtalo de nuevo.';
    }
  }
};

const handleScroll = async (event: Event) => {
  if (!props.chatRoom || isLoadingOlderMessages.value || !hasMoreMessages.value) return;
  
  const target = event.target as HTMLElement;
  const scrollTop = target.scrollTop;
  
  // If scrolled near the top (within 100px), load more messages
  if (scrollTop <= 100) {
    isLoadingOlderMessages.value = true;
    
    try {
      await chat.loadMoreMessages(props.chatRoom.id);
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      isLoadingOlderMessages.value = false;
    }
  }
};

const formatChatDate = (date: Date) => {
  const now = new Date();
  const messageDate = new Date(date);
  
  if (messageDate.toDateString() === now.toDateString()) {
    return 'Hoy';
  } else if (messageDate.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
    return 'Ayer';
  } else {
    return messageDate.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric' 
    });
  }
};

const formatMessageTime = (date: Date) => {
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
</script> 