<script setup>
import { ref, onMounted } from "vue";
import { instance } from "@/api/base.js";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
    validator: (value) => !isNaN(parseInt(value)), 
  },
  getContextMethod: Function,
});

const messageText = ref("");
const history = ref([]);
const isOpen = ref(false);
const isLoading = ref(false);
const error = ref(null);

onMounted(() => {
  validateProjectId();
});

const validateProjectId = () => {
  if (!props.projectId) {
    console.error("Project ID is required but was not provided");
    error.value = "Missing project ID. Chat functionality is disabled.";
    return false;
  }

  if (typeof props.projectId === 'string' && isNaN(parseInt(props.projectId))) {
    console.error("Project ID must be a valid integer");
    error.value = "Invalid project ID. Chat functionality is disabled.";
    return false;
  }
  return true;
};

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const sendMessage = async () => {
  const text = messageText.value;
  if (!text.trim()) return;

  if (!validateProjectId()) return;

  const projectIdNum = typeof props.projectId === 'string' 
    ? parseInt(props.projectId) 
    : props.projectId;

  messageText.value = "";
  history.value.push({ role: 1, content: text });
  isLoading.value = true;
  error.value = null;

  try {
    const payload = {
      content: text
    };

    if (props.getContextMethod) {
      const context = props.getContextMethod();
      console.log('Received context:', context); 
      if (Array.isArray(context)) {
        payload.context = context;
      } else {
        console.warn('Invalid context: Expected an array, got:', context);
      }
    }

    payload.history = [{ role: 1, content: text }];

    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    const response = await instance.post(`/chat/${projectIdNum}/message`, payload);
    console.log('Server response:', response.data); 
    history.value.push({ role: 0, content: response.data.content });
  } catch (error) {
    console.error("Error sending message:", error);
    let errorMessage = "Error: Failed to get response";
    if (error.response && error.response.data) {
      console.log("Server error details:", error.response.data);
      errorMessage = `Error: ${error.response.status} - ${error.response.data.detail || 'Unknown error'}`;
    }
    history.value.push({ role: 0, content: errorMessage });
  } finally {
    isLoading.value = false;
  }
};

const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};
</script>

<template>
  <div class="chat-container">
    <!-- Chat window -->
    <transition name="slide">
      <v-card v-if="isOpen" class="chat-card">
        <v-card-title class="chat-title">
          AI Chat
        </v-card-title>

        <v-card-text v-if="error" class="error-message">
          {{ error }}
        </v-card-text>

        <v-card-text v-else class="chat-history">
          <div v-for="(message, index) in history" :key="index" 
               :class="['message', message.role === 1 ? 'user-message' : 'ai-message']">
            <strong>{{ message.role === 1 ? 'You' : 'AI' }}:</strong> {{ message.content }}
          </div>
          <div v-if="isLoading" class="loading-indicator">
            <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
          </div>
        </v-card-text>

        <v-card-item class="input-container">
          <v-text-field
            hide-details="true"
            append-inner-icon="mdi-send"
            v-model="messageText"
            placeholder="Type your message here..."
            @click:append-inner="sendMessage"
            @keydown="handleKeyDown"
            class="message-input"
            :disabled="!!error || isLoading"
          />
        </v-card-item>
      </v-card>
    </transition>
    
    <!-- Toggle button -->
    <button class="toggle-button" @click="toggleChat">
      <v-icon>{{ isOpen ? 'mdi-close' : 'mdi-chat' }}</v-icon>
    </button>
  </div>
</template>

<style scoped>
.chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.toggle-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #9FA8DA;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1001;
}

.chat-card {
  width: 400px;
  height: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 60px; /* Space for button */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  position: absolute;
  bottom: 0;
  right: 0;
}

.chat-title {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  font-size: 16px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  max-height: 200px;
}

.message {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 8px;
  max-width: 80%;
}

.user-message {
  background-color: #e3f2fd;
  text-align: right;
  margin-left: auto;
}

.ai-message {
  background-color: #f5f5f5;
  text-align: left;
  margin-right: auto;
}

.input-container {
  padding: 8px;
  border-top: 1px solid #ddd;
}

.message-input {
  width: 100%;
}

.error-message {
  color: #f44336;
  text-align: center;
  padding: 16px;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>