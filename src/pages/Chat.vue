<template>
  <q-page class="chat-page q-pa-md" :class="{ 'chat-page-mobile': $q.screen.lt.sm }">
    <!-- Сообщение для администраторов -->
    <div v-if="authStore.isAdmin" class="admin-redirect-container q-pa-xl">
      <div class="text-center">
        <q-icon name="admin_panel_settings" size="4rem" color="primary" />
        <h5 class="q-mt-md">Доступ ограничен</h5>
        <p class="q-my-md">Как администратор, вы можете отвечать на обращения клиентов в разделе администратора.</p>
        <q-btn color="primary" label="Перейти к управлению чатами" to="/admin/chats" icon="support_agent"
          class="q-mt-md" />
      </div>
    </div>

    <!-- Основной чат (скрыт для администраторов) -->
    <div v-else class="chat-wrapper">
      <div class="unified-chat-container">
        <!-- Левая панель: список чатов -->
        <div class="chat-list-panel">
          <div class="chat-list-header q-px-md q-py-sm">
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-medium">Мои чаты</div>
              <q-btn flat round dense icon="refresh" @click="retryInitializeChat" color="primary" size="sm" />
            </div>
          </div>

          <q-list separator class="chat-list-content scroll" bordered>
            <!-- Выбранный чат поддержки (активен по умолчанию) -->
            <q-item clickable active active-class="bg-primary text-white" class="support-chat-item">
              <q-item-section avatar>
                <q-avatar color="primary">
                  <q-icon name="support_agent" color="white" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>Служба поддержки</q-item-label>
                <q-item-label caption lines="1" class="ellipsis">
                  {{ chatStore.messages && chatStore.messages.length > 0 ?
                    chatStore.messages[chatStore.messages.length - 1].text : 'Напишите нам...' }}
                </q-item-label>
              </q-item-section>

              <q-item-section side v-if="hasNewMessages">
                <q-badge color="red" rounded>{{ chatStore.unreadCount }}</q-badge>
              </q-item-section>
            </q-item>

            <!-- Здесь могут быть другие чаты, если будут добавлены в будущем -->
          </q-list>
        </div>

        <!-- Правая панель: выбранный чат -->
        <div class="chat-content-panel">
          <!-- Заголовок чата -->
          <div class="chat-header q-px-md q-py-sm">
            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-avatar color="primary" size="sm" class="q-mr-sm">
                  <q-icon name="support_agent" size="sm" color="white" />
                </q-avatar>
                <div>
                  <div class="text-subtitle2 text-weight-medium">Служба поддержки</div>
                  <div class="text-caption" v-if="isOnline">Онлайн</div>
                  <div class="text-caption" v-else>Офлайн</div>
                </div>
              </div>
              <div class="row items-center">
                <q-btn v-if="chatStore.error" flat round dense icon="refresh" color="negative"
                  @click="retryInitializeChat" class="q-mr-xs" />
                <div v-if="chatStore.error" class="text-negative text-caption">
                  {{ chatStore.error }}
                </div>
                <q-btn flat round dense icon="delete" color="grey-7" @click="confirmDeleteChat" class="q-ml-xs" />
              </div>
            </div>
          </div>

          <!-- Сообщение об ошибке -->
          <div v-if="chatStore.error" class="error-message q-pa-xs">
            <div class="text-negative text-caption text-center">
              Произошла ошибка при загрузке сообщений.
              <q-btn flat dense size="sm" color="primary" label="Попробовать снова" @click="retryInitializeChat" />
            </div>
          </div>

          <!-- Окно сообщений -->
          <div class="chat-messages" ref="messagesContainer">
            <div v-if="chatStore.loading" class="full-width flex flex-center q-pa-md">
              <q-spinner color="primary" size="2em" />
            </div>

            <div v-else-if="!chatStore.chatId && !chatStore.error" class="empty-chat flex flex-center column q-pa-md">
              <q-icon name="chat" color="grey-5" size="3em" />
              <div class="text-grey-7 text-body2 q-mt-sm text-center">
                Напишите ваш вопрос в поле ниже, и мы свяжемся с вами в ближайшее время
              </div>
            </div>

            <div v-else-if="!chatStore.messages || chatStore.messages.length === 0 && !chatStore.error"
              class="empty-chat flex flex-center column q-pa-md">
              <q-icon name="chat" color="grey-5" size="3em" />
              <div class="text-grey-7 text-body2 q-mt-sm text-center">
                Напишите свой вопрос, и наша служба поддержки ответит вам в ближайшее время
              </div>
            </div>

            <template v-if="chatStore.messages && chatStore.messages.length > 0">
              <div v-for="(message, index) in chatStore.messages" :key="message.id || index" :class="[
                'message-bubble q-my-xs q-px-sm q-py-xs',
                message.isUser ? 'sent' : 'received'
              ]">
                <div class="message-text text-body2">{{ message.text }}</div>
                <div class="message-info row justify-between items-center q-mt-xs">
                  <div class="message-time text-caption">
                    {{ formatTime(message.timestamp) }}
                  </div>
                  <div v-if="message.isUser" class="read-status q-ml-xs">
                    <q-icon :name="message.readByAdmin ? 'done_all' : 'done'" size="12px"
                      :color="message.readByAdmin ? 'light-blue-6' : 'grey-5'" />
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Поле ввода -->
          <div class="chat-input q-pa-sm">
            <q-form @submit="sendMessage" class="row">
              <q-input v-model="newMessage" placeholder="Введите сообщение..." dense class="col"
                @keydown.enter.prevent="sendMessage" bg-color="white" outlined hide-bottom-space>
                <template v-slot:prepend>
                  <q-icon name="sentiment_satisfied_alt" class="cursor-pointer" size="xs">
                    <q-menu>
                      <div class="row no-wrap q-pa-sm">
                        <div v-for="emoji in commonEmojis" :key="emoji" class="cursor-pointer q-pa-xs text-subtitle1"
                          @click="addEmoji(emoji)">
                          {{ emoji }}
                        </div>
                      </div>
                    </q-menu>
                  </q-icon>
                </template>
              </q-input>

              <q-btn round dense flat color="primary" icon="send" class="q-ml-xs" type="submit"
                :disable="!newMessage.trim()" />
            </q-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог подтверждения удаления чата -->
    <q-dialog v-model="deleteChatDialog.show" persistent>
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" size="sm" />
          <span class="q-ml-sm text-subtitle1">Удаление переписки</span>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p class="q-my-sm">Вы действительно хотите удалить всю историю переписки с службой поддержки?</p>
          <p class="text-negative text-caption">Внимание: это действие нельзя отменить. Вся история сообщений будет
            удалена.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Удалить" color="negative" @click="deleteChat" :loading="deleteChatDialog.loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed, onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { useChatStore } from 'src/stores/chat';
import { useRouter } from 'vue-router';
import {
  db,
  collection,
  query,
  orderBy,
  getDocs,
  where,
  limit
} from "src/boot/firebase";

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

// Перенаправление администраторов в раздел поддержки
watch(() => authStore.isAdmin, (isAdmin) => {
  if (isAdmin) {
    // Если это первоначальная загрузка, показываем сообщение
    // Если пользователь стал админом во время сессии, перенаправляем
    if (chatStore.messages.length === 0) {
      // Оставляем на странице с сообщением
    } else {
      router.push('/admin/chats');
    }
  }
}, { immediate: true });

const messagesContainer = ref(null);
const newMessage = ref('');
const isOnline = ref(true); // Можно связать с реальным статусом поддержки
const hasNewMessages = computed(() => chatStore.unreadCount > 0);
const debugExpanded = ref(false);

// Диалог подтверждения удаления чата
const deleteChatDialog = ref({
  show: false,
  loading: false
});

const commonEmojis = ['😊', '👍', '🙏', '❤️', '👋', '🎉', '😂', '🤔', '👀', '✅'];

// Debugger функция
const logChatState = () => {
  console.log("Chat state:", {
    messagesLength: chatStore.messages ? chatStore.messages.length : 'null',
    chatId: chatStore.chatId,
    loading: chatStore.loading,
    error: chatStore.error,
    unreadCount: chatStore.unreadCount
  });

  if (chatStore.messages && chatStore.messages.length > 0) {
    console.log("First message:", chatStore.messages[0]);
  }
};

// Вызываем логгер при изменении сообщений
watch(() => chatStore.messages, () => {
  logChatState();
}, { deep: true });

// Инициализация чата
const initializeChat = async () => {
  if (!authStore.isAdmin) {
    try {
      chatStore.error = ""; // Сбрасываем предыдущие ошибки
      console.log("Initializing chat...");
      await chatStore.initChat();

      // Если есть идентификатор чата (чат уже существует), загружаем сообщения
      if (chatStore.chatId) {
        console.log("Chat initialized, messages:", chatStore.messages.length);
        logChatState();
        scrollToBottom();
      } else {
        console.log("No chat exists yet. It will be created when user sends a message.");
      }
    } catch (error) {
      console.error('Ошибка при инициализации чата:', error);
      $q.notify({
        color: 'negative',
        message: 'Ошибка при инициализации чата. Попробуйте позже.',
        icon: 'error',
        timeout: 3000
      });
    }
  }
};

// Повторная инициализация чата при ошибке
const retryInitializeChat = async () => {
  chatStore.resetChat(); // Очищаем текущее состояние
  await initializeChat();
};

// Открыть диалог подтверждения удаления чата
const confirmDeleteChat = () => {
  deleteChatDialog.value.show = true;
  deleteChatDialog.value.loading = false;
};

// Удалить текущий чат
const deleteChat = async () => {
  deleteChatDialog.value.loading = true;
  try {
    const success = await chatStore.deleteChat();

    if (success) {
      $q.notify({
        color: 'positive',
        message: 'Переписка успешно удалена',
        icon: 'check_circle',
        timeout: 2000
      });

      // Инициализируем новый чат
      await initializeChat();
    } else {
      throw new Error(chatStore.error || 'Не удалось удалить переписку');
    }

    deleteChatDialog.value.show = false;
  } catch (error) {
    console.error('Ошибка при удалении чата:', error);
    $q.notify({
      color: 'negative',
      message: `Ошибка при удалении переписки: ${error.message || 'Неизвестная ошибка'}`,
      icon: 'error',
      timeout: 3000
    });
  } finally {
    deleteChatDialog.value.loading = false;
  }
};

// Прямое получение сообщений из Firebase (обходной путь)
const fetchMessagesDirectly = async () => {
  if (!chatStore.chatId) {
    console.error("Cannot fetch messages: No chat ID");
    return;
  }

  try {
    console.log("Fetching messages directly for chat:", chatStore.chatId);
    const messagesRef = collection(db, "chats", chatStore.chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const snapshot = await getDocs(q);
    console.log(`Direct fetch: Got ${snapshot.docs.length} messages`);

    if (snapshot.docs.length > 0 && chatStore.messages.length === 0) {
      console.log("Messages not showing in store, forcing update...");
      await chatStore.resetChat();
      await initializeChat();
    }
  } catch (error) {
    console.error("Error fetching messages directly:", error);
  }
};

// Инициализация чата при монтировании компонента
onMounted(async () => {
  if (!authStore.isAdmin) {
    await initializeChat();
    // Даем время на инициализацию и затем проверяем напрямую
    setTimeout(fetchMessagesDirectly, 1000);
  }
});

// Периодически проверяем наличие сообщений
let checkInterval;
onMounted(() => {
  checkInterval = setInterval(() => {
    if (chatStore.chatId && chatStore.messages.length === 0) {
      console.log("Periodic check: no messages showing, trying direct fetch");
      fetchMessagesDirectly();
    }
  }, 5000); // Проверяем каждые 5 секунд
});

onBeforeUnmount(() => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
});

// Следим за изменениями в сообщениях, чтобы прокручивать чат вниз
watch(() => chatStore.messages.length, () => {
  scrollToBottom();
});

// Функция для отправки сообщения
const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    console.log("Sending message:", newMessage.value);
    await chatStore.sendMessage(newMessage.value);
    console.log("Message sent, current messages count:", chatStore.messages.length);
    newMessage.value = '';

    // Если после отправки сообщений нет в списке - делаем проверку
    setTimeout(() => {
      if (chatStore.messages.length === 0) {
        console.log("After sending, messages are still not showing. Fetching directly...");
        fetchMessagesDirectly();
      }
    }, 1000);

  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    $q.notify({
      color: 'negative',
      message: 'Не удалось отправить сообщение. Попробуйте позже.',
      icon: 'error',
      timeout: 3000
    });
  }
};

// Форматирование времени
const formatTime = (timestamp) => {
  if (!timestamp) return '';

  try {
    let date;
    if (timestamp.toDate) {
      // Если это Firestore timestamp
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      // Если это серверный timestamp в виде объекта {seconds: number, nanoseconds: number}
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'object' && timestamp instanceof Date) {
      // Если это объект Date
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      // Если это milliseconds
      date = new Date(timestamp);
    } else {
      // В других случаях пытаемся создать Date из того, что есть
      date = new Date();
    }

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Ошибка форматирования времени:', error, 'Timestamp:', timestamp);
    return 'только что';
  }
};

// Прокрутка чата вниз после добавления новых сообщений
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      const totalHeight = messagesContainer.value.scrollHeight;
      const maxHeight = $q.screen.lt.sm ? 250 : 350;

      // Если все сообщения помещаются в окне, устанавливаем высоту по контенту
      if (totalHeight <= maxHeight) {
        messagesContainer.value.style.height = `${totalHeight}px`;
        messagesContainer.value.style.overflowY = 'hidden';
      } else {
        messagesContainer.value.style.height = `${maxHeight}px`;
        messagesContainer.value.style.overflowY = 'auto';
        // При превышении максимальной высоты, прокручиваем вниз
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    }
  });
};

// Добавление эмодзи к сообщению
const addEmoji = (emoji) => {
  newMessage.value += emoji;
};

// Следим за статусом аутентификации
watch(() => authStore.isAuthenticated, async (newValue) => {
  if (newValue && !authStore.isAdmin) {
    await initializeChat();
  }
}, { immediate: true });
</script>

<style lang="scss">
.chat-page {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.chat-wrapper {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.unified-chat-container {
  width: 100%;
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  height: 80vh;
  max-height: 600px;
  background-color: white;
}

.chat-list-panel {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-list-header {
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f8f8;
}

.chat-list-content {
  flex: 1;
  overflow-y: auto;
}

.chat-content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f8f8;
}

.error-message {
  background-color: #ffebee;
  border-bottom: 1px solid #ffcdd2;
  font-size: 12px;
}

.chat-messages {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background-color: #f5f5f5;
}

.message-bubble {
  max-width: 75%;
  border-radius: 12px;
  position: relative;
  margin: 4px 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.sent {
  background-color: #e3f2fd;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.received {
  background-color: white;
  margin-right: auto;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-info {
  font-size: 10px;
  color: #9e9e9e;
}

.chat-input {
  border-top: 1px solid #e0e0e0;
  background-color: #f8f8f8;
  padding: 8px;
}

.empty-chat {
  height: 100%;
  color: #bdbdbd;
}

.admin-redirect-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Мобильный режим */
.chat-page-mobile .chat-wrapper {
  max-width: 100%;
  padding: 0;
}

.chat-page-mobile .unified-chat-container {
  flex-direction: column;
  height: calc(100vh - 120px);
  border-radius: 8px;
}

.chat-page-mobile .chat-list-panel {
  width: 100%;
  height: 30%;
  min-height: 200px;
  border-right: none;
  border-bottom: 1px solid #e0e0e0;
}

.chat-page-mobile .chat-content-panel {
  height: 70%;
}

.support-chat-item {
  &.q-item--active {
    background-color: #e3f2fd !important;
    color: #1976d2 !important;
  }
}

@media (max-width: 599px) {
  .chat-page {
    padding: 8px !important;
  }

  .message-bubble {
    max-width: 85%;
  }
}
</style>
