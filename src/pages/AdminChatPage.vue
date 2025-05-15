<template>
    <q-page class="admin-chat-page q-pa-md" :class="{ 'q-pa-xs': $q.screen.lt.sm }">
        <div class="chat-wrapper">
            <div class="text-h5 q-mb-md q-px-sm">Чаты поддержки</div>

            <div class="unified-admin-chat-container" :class="{ 'mobile-chat': $q.screen.lt.md }">
                <!-- Левая панель: список чатов -->
                <div class="chat-list-panel">
                    <div class="chat-list-header q-pa-md">
                        <div class="row items-center justify-between">
                            <div>
                                <span class="text-subtitle1 text-weight-medium">Активные чаты</span>
                                <q-badge color="primary" class="q-ml-sm" v-if="totalUnreadMessages > 0">
                                    {{ totalUnreadMessages }}
                                </q-badge>
                            </div>
                            <div class="row items-center">
                                <q-btn v-if="selectedChatId && $q.screen.lt.md" flat dense icon="arrow_back"
                                    color="primary" @click="unselectChat" :label="$q.screen.gt.xs ? 'Назад' : null"
                                    class="q-mr-xs" />
                                <q-btn flat dense color="negative" icon="delete_sweep" size="sm"
                                    @click="confirmDeleteAllChats" v-if="chats.length > 0" />
                            </div>
                        </div>
                    </div>

                    <q-list separator v-if="!selectedChatId || !$q.screen.lt.md" class="chat-list-content scroll"
                        bordered>
                        <q-item v-for="chat in chats" :key="chat.id" clickable :active="selectedChatId === chat.id"
                            active-class="bg-primary text-white" @click="selectChat(chat.id)" class="chat-list-item">
                            <q-item-section avatar>
                                <q-avatar color="grey-4" text-color="grey-9">
                                    {{ getInitials(chat.userEmail) }}
                                </q-avatar>
                            </q-item-section>

                            <q-item-section>
                                <q-item-label class="ellipsis">{{ chat.userEmail }}</q-item-label>
                                <q-item-label caption lines="1" class="ellipsis">
                                    {{ chat.lastMessage || 'Новый чат' }}
                                </q-item-label>
                            </q-item-section>

                            <q-item-section side>
                                <div class="row items-center">
                                    <q-item-label caption class="q-mr-xs">
                                        {{ formatChatTime(chat.updatedAt) }}
                                    </q-item-label>
                                    <q-badge v-if="chat.unreadByAdmin" color="red" rounded>
                                        {{ chat.unreadByAdmin }}
                                    </q-badge>
                                </div>
                                <q-btn flat dense round color="grey-6" icon="delete" size="sm"
                                    @click.stop="confirmDeleteChat(chat.id, chat.userEmail)" class="q-mt-xs" />
                            </q-item-section>
                        </q-item>

                        <q-item v-if="loading">
                            <q-item-section>
                                <div class="flex flex-center">
                                    <q-spinner color="primary" />
                                </div>
                            </q-item-section>
                        </q-item>

                        <q-item v-if="!loading && !chats.length">
                            <q-item-section>
                                <div class="text-grey text-center q-pa-md">
                                    Нет активных чатов
                                </div>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Правая панель: выбранный чат -->
                <div class="chat-content-panel">
                    <template v-if="selectedChatId">
                        <!-- Заголовок чата -->
                        <div class="chat-header q-pa-md">
                            <div class="row items-center justify-between">
                                <div class="row items-center">
                                    <q-avatar color="grey-4" text-color="grey-9" class="q-mr-sm">
                                        {{ selectedChat ? getInitials(selectedChat.userEmail) : '' }}
                                    </q-avatar>
                                    <div>
                                        <div class="text-weight-bold">{{ selectedChat ? selectedChat.userEmail : '' }}
                                        </div>
                                        <div class="text-caption">{{ selectedChat ?
                                            formatChatDate(selectedChat.createdAt) :
                                            '' }}</div>
                                    </div>
                                </div>
                                <div class="row items-center">
                                    <q-btn flat round dense icon="delete" color="negative"
                                        @click="confirmDeleteChat(selectedChatId, selectedChat?.userEmail)"
                                        class="q-mr-xs" />
                                </div>
                            </div>
                        </div>

                        <!-- Сообщение об ошибке -->
                        <div v-if="error" class="error-message q-pa-sm">
                            <div class="text-negative text-caption text-center">
                                Произошла ошибка при загрузке сообщений.
                                <q-btn flat dense size="sm" color="primary" label="Попробовать снова"
                                    @click="retryLoadMessages" />
                            </div>
                        </div>

                        <!-- Окно сообщений -->
                        <div class="chat-messages" ref="messagesContainer">
                            <div v-if="loadingMessages" class="full-width flex flex-center q-pa-xl">
                                <q-spinner color="primary" size="3em" />
                            </div>

                            <div v-else-if="!loadingMessages && !messages.length"
                                class="empty-chat flex flex-center column q-pa-xl">
                                <q-icon name="chat" color="grey-5" size="6em" />
                                <div class="text-grey q-mt-md">Нет сообщений в этом чате</div>
                            </div>

                            <template v-else>
                                <div v-for="message in messages" :key="message.id" :class="[
                                    'message-bubble q-my-sm q-px-md q-py-sm',
                                    message.isUser ? 'received' : 'sent'
                                ]">
                                    <div class="message-text">{{ message.text }}</div>
                                    <div class="message-info row justify-between items-center q-mt-xs">
                                        <div class="message-time text-caption">
                                            {{ formatTime(message.timestamp) }}
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <!-- Поле ввода -->
                        <div class="chat-input q-pa-sm">
                            <q-form @submit="sendAdminMessage" class="row">
                                <q-input v-model="newMessage" placeholder="Введите сообщение..." outlined dense
                                    bg-color="white" class="col" @keydown.enter.prevent="sendAdminMessage">
                                    <template v-slot:prepend>
                                        <q-icon name="sentiment_satisfied_alt" class="cursor-pointer">
                                            <q-menu>
                                                <div class="row no-wrap q-pa-md">
                                                    <div v-for="emoji in commonEmojis" :key="emoji"
                                                        class="cursor-pointer q-pa-xs text-h6" @click="addEmoji(emoji)">
                                                        {{ emoji }}
                                                    </div>
                                                </div>
                                            </q-menu>
                                        </q-icon>
                                    </template>
                                </q-input>

                                <q-btn round dense flat color="primary" icon="send" class="q-ml-sm" type="submit"
                                    :disable="!newMessage.trim()" />
                            </q-form>
                        </div>
                    </template>

                    <!-- Пустой экран при отсутствии выбранного чата -->
                    <div v-if="!selectedChatId" class="empty-chat-container flex flex-center column q-pa-xl">
                        <q-icon name="chat" color="grey-5" size="6em" />
                        <div class="text-grey q-mt-md">Выберите чат из списка слева</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Диалог подтверждения удаления чата -->
        <q-dialog v-model="deleteDialog.show" persistent>
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="delete" color="negative" text-color="white" />
                    <span class="q-ml-sm text-h6">Удаление чата</span>
                </q-card-section>

                <q-card-section>
                    <p>Вы действительно хотите удалить чат с пользователем <strong>{{ deleteDialog.userEmail
                            }}</strong>?</p>
                    <p class="text-negative text-caption">Внимание: это действие нельзя отменить. Все сообщения будут
                        удалены.
                    </p>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Отмена" color="primary" v-close-popup />
                    <q-btn flat label="Удалить" color="negative" @click="deleteChat" :loading="deleteDialog.loading" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Диалог подтверждения удаления всех чатов -->
        <q-dialog v-model="deleteAllDialog.show" persistent>
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="delete_sweep" color="negative" text-color="white" />
                    <span class="q-ml-sm text-h6">Удаление всех чатов</span>
                </q-card-section>

                <q-card-section>
                    <p>Вы действительно хотите удалить <strong>ВСЕ</strong> чаты?</p>
                    <p class="text-negative text-caption">Внимание: это действие нельзя отменить. Все чаты и сообщения
                        будут
                        удалены.</p>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Отмена" color="primary" v-close-popup />
                    <q-btn flat label="Удалить все" color="negative" @click="deleteAllChats"
                        :loading="deleteAllDialog.loading" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import {
    db,
    collection,
    query,
    orderBy,
    getDocs,
    getDoc,
    onSnapshot,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    limit,
    increment,
    writeBatch
} from 'src/boot/firebase';

const $q = useQuasar();
const authStore = useAuthStore();

const chats = ref([]);
const selectedChatId = ref(null);
const selectedChat = ref(null);
const messages = ref([]);
const newMessage = ref('');
const loading = ref(true);
const loadingMessages = ref(false);
const messagesContainer = ref(null);
const commonEmojis = ['😊', '👍', '🙏', '❤️', '👋', '🎉', '😂', '🤔', '👀', '✅'];

// Диалог подтверждения удаления
const deleteDialog = ref({
    show: false,
    chatId: null,
    userEmail: '',
    loading: false
});

// Диалог подтверждения удаления всех чатов
const deleteAllDialog = ref({
    show: false,
    loading: false
});

// Ограничиваем количество чатов и сообщений для бесплатного плана
const CHATS_LIMIT = 20;
const MESSAGES_LIMIT = 25;

let messagesUnsubscribe = null;

// Состояние для отслеживания ошибок
const error = ref("");

// Общее количество непрочитанных сообщений для администратора
const totalUnreadMessages = computed(() => {
    return chats.value.reduce((total, chat) => total + (chat.unreadByAdmin || 0), 0);
});

// Получаем список всех чатов
const fetchChats = async () => {
    loading.value = true;
    try {
        const chatsRef = collection(db, "chats");
        const q = query(chatsRef, orderBy("updatedAt", "desc"), limit(CHATS_LIMIT));

        // Устанавливаем подписку на обновления чатов
        onSnapshot(q, (snapshot) => {
            chats.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Сортируем чаты так, чтобы чаты с непрочитанными сообщениями были вверху
            chats.value.sort((a, b) => {
                // Сначала по наличию непрочитанных сообщений
                if ((a.unreadByAdmin || 0) > 0 && (b.unreadByAdmin || 0) === 0) return -1;
                if ((a.unreadByAdmin || 0) === 0 && (b.unreadByAdmin || 0) > 0) return 1;

                // Затем по времени последнего сообщения
                const timeA = a.updatedAt ? (a.updatedAt.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt)) : new Date(0);
                const timeB = b.updatedAt ? (b.updatedAt.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt)) : new Date(0);

                return timeB - timeA;
            });

            loading.value = false;

            // Если есть чаты с непрочитанными сообщениями и нет выбранного чата,
            // выбираем первый чат с непрочитанными сообщениями
            if (!selectedChatId.value) {
                const unreadChat = chats.value.find(chat => (chat.unreadByAdmin || 0) > 0);
                if (unreadChat) {
                    selectChat(unreadChat.id);
                }
            }
        });
    } catch (error) {
        console.error("Ошибка при получении чатов:", error);
        loading.value = false;
        $q.notify({
            color: 'negative',
            message: 'Ошибка при загрузке чатов',
            icon: 'error'
        });
    }
};

// Отменить выбор чата (для мобильной версии)
const unselectChat = () => {
    selectedChatId.value = null;
    selectedChat.value = null;
    messages.value = [];
    if (messagesUnsubscribe) {
        messagesUnsubscribe();
        messagesUnsubscribe = null;
    }
};

// Открыть диалог подтверждения удаления чата
const confirmDeleteChat = (chatId, userEmail) => {
    deleteDialog.value = {
        show: true,
        chatId,
        userEmail: userEmail || 'неизвестного пользователя',
        loading: false
    };
};

// Удалить чат и все его сообщения
const deleteChat = async () => {
    if (!deleteDialog.value.chatId) return;

    deleteDialog.value.loading = true;
    try {
        const chatId = deleteDialog.value.chatId;
        const batch = writeBatch(db);

        // 1. Получаем все сообщения чата
        const messagesRef = collection(db, "chats", chatId, "messages");
        const messagesSnapshot = await getDocs(messagesRef);

        // 2. Добавляем в batch операции удаления каждого сообщения
        messagesSnapshot.docs.forEach(messageDoc => {
            batch.delete(doc(db, "chats", chatId, "messages", messageDoc.id));
        });

        // 3. Добавляем в batch операцию удаления самого чата
        batch.delete(doc(db, "chats", chatId));

        // 4. Выполняем все операции атомарно
        await batch.commit();

        // 5. Если удален текущий выбранный чат, снимаем выбор
        if (selectedChatId.value === chatId) {
            unselectChat();
        }

        // Показываем уведомление об успешном удалении
        $q.notify({
            color: 'positive',
            message: 'Чат успешно удален',
            icon: 'check_circle',
            timeout: 2000
        });

        deleteDialog.value.show = false;
    } catch (error) {
        console.error("Ошибка при удалении чата:", error);
        $q.notify({
            color: 'negative',
            message: `Ошибка при удалении чата: ${error.message || 'Неизвестная ошибка'}`,
            icon: 'error',
            timeout: 3000
        });
    } finally {
        deleteDialog.value.loading = false;
    }
};

// Выбор чата
const selectChat = async (chatId) => {
    selectedChatId.value = chatId;
    loadingMessages.value = true;
    messages.value = [];
    error.value = ""; // Сбрасываем ошибки

    // Отписываемся от предыдущей подписки на сообщения
    if (messagesUnsubscribe) {
        messagesUnsubscribe();
        messagesUnsubscribe = null;
    }

    try {
        // Получаем данные о выбранном чате
        const chatDoc = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatDoc);

        if (!chatSnap.exists()) {
            throw new Error("Чат не найден");
        }

        selectedChat.value = {
            id: chatId,
            ...chatSnap.data()
        };

        // Если есть непрочитанные сообщения, сбрасываем счетчик
        if (selectedChat.value && selectedChat.value.unreadByAdmin) {
            await updateDoc(chatDoc, {
                unreadByAdmin: 0
            });
        }

        // Подписываемся на обновления сообщений в выбранном чате с лимитом
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "desc"), limit(MESSAGES_LIMIT));

        messagesUnsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                try {
                    if (!snapshot || !snapshot.docs) {
                        messages.value = [];
                        loadingMessages.value = false;
                        return;
                    }

                    const newMessages = snapshot.docs
                        .filter(doc => doc && doc.exists())
                        .map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                        }))
                        .reverse(); // Разворачиваем, так как запрашивали в обратном порядке

                    messages.value = newMessages;
                    loadingMessages.value = false;
                    scrollToBottom();

                    // Помечаем сообщения пользователя как прочитанные администратором
                    if (newMessages && newMessages.length > 0) {
                        await markMessagesAsReadByAdmin(newMessages);
                    }
                } catch (err) {
                    console.error("Ошибка при обработке сообщений:", err);
                    error.value = err.message || "Ошибка при обработке сообщений";
                    loadingMessages.value = false;
                }
            },
            (err) => {
                console.error("Ошибка при получении сообщений:", err);
                error.value = err.message || "Ошибка при получении сообщений";
                loadingMessages.value = false;

                $q.notify({
                    color: 'negative',
                    message: 'Ошибка при загрузке сообщений: ' + err.message,
                    icon: 'error',
                    timeout: 5000
                });
            }
        );
    } catch (err) {
        console.error("Ошибка при получении сообщений:", err);
        error.value = err.message || "Ошибка при получении сообщений";
        loadingMessages.value = false;

        $q.notify({
            color: 'negative',
            message: 'Ошибка при загрузке сообщений: ' + err.message,
            icon: 'error',
            timeout: 5000
        });
    }
};

// Помечаем сообщения пользователя как прочитанные администратором
const markMessagesAsReadByAdmin = async (msgs) => {
    if (!selectedChatId.value || !authStore.user || !msgs || !Array.isArray(msgs)) return;

    try {
        // Фильтруем только сообщения пользователя (не админа) и только те, что еще не прочитаны
        const unreadUserMsgs = msgs.filter(msg => {
            return msg &&
                typeof msg === 'object' &&
                'isUser' in msg &&
                'readByAdmin' in msg &&
                'id' in msg &&
                msg.isUser === true &&
                msg.readByAdmin === false;
        });

        if (unreadUserMsgs.length === 0) return;

        // Обновляем статус каждого сообщения
        for (const msg of unreadUserMsgs) {
            try {
                const msgRef = doc(db, "chats", selectedChatId.value, "messages", msg.id);
                await updateDoc(msgRef, {
                    readByAdmin: true
                });
            } catch (updateErr) {
                console.error(`Ошибка при обновлении сообщения ${msg.id}:`, updateErr);
                // Продолжаем с другими сообщениями, не прерывая цикл
            }
        }
    } catch (err) {
        console.error("Ошибка при обновлении статуса сообщений:", err);
    }
};

// Отправка сообщения от администратора
const sendAdminMessage = async () => {
    if (!newMessage.value.trim() || !selectedChatId.value || !authStore.user) return;

    try {
        const messagesRef = collection(db, "chats", selectedChatId.value, "messages");
        const newAdminMessage = {
            text: newMessage.value,
            senderId: authStore.user.uid,
            senderEmail: authStore.user.email,
            isUser: false, // Это сообщение от администратора
            timestamp: serverTimestamp(),
            readByAdmin: true, // Админ уже прочитал свое сообщение
            readByUser: false, // Пользователь еще не прочитал
        };

        // Добавляем сообщение в коллекцию
        await addDoc(messagesRef, newAdminMessage);

        // Обновляем время последнего сообщения в чате и счетчик непрочитанных для пользователя
        const chatRef = doc(db, "chats", selectedChatId.value);
        await updateDoc(chatRef, {
            updatedAt: serverTimestamp(),
            lastMessage: newMessage.value,
            unreadByUser: increment(1)
        });

        newMessage.value = '';
    } catch (err) {
        console.error("Ошибка отправки сообщения:", err);
        $q.notify({
            color: 'negative',
            message: 'Не удалось отправить сообщение: ' + (err.message || 'Неизвестная ошибка'),
            icon: 'error',
            timeout: 3000
        });
    }
};

// Прокрутка чата вниз после добавления новых сообщений - заменяем на динамическое изменение размера
const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            const totalHeight = messagesContainer.value.scrollHeight;
            const maxHeight = $q.screen.lt.sm ? 250 : 350;

            // Если все сообщения помещаются в окне, устанавливаем высоту по контенту
            // В противном случае ограничиваем максимальной высотой
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

// Получение инициалов из email
const getInitials = (email) => {
    if (!email) return '';
    return email.substring(0, 2).toUpperCase();
};

// Форматирование времени для сообщения
const formatTime = (timestamp) => {
    if (!timestamp) return '';

    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        console.error('Ошибка форматирования времени:', error);
        return '';
    }
};

// Форматирование времени для чата в списке
const formatChatTime = (timestamp) => {
    if (!timestamp) return '';

    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'вчера';
        } else {
            return date.toLocaleDateString();
        }
    } catch (error) {
        console.error('Ошибка форматирования времени чата:', error);
        return '';
    }
};

// Форматирование даты создания чата
const formatChatDate = (timestamp) => {
    if (!timestamp) return '';

    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        console.error('Ошибка форматирования даты чата:', error);
        return '';
    }
};

// Добавление эмодзи к сообщению
const addEmoji = (emoji) => {
    newMessage.value += emoji;
};

// Следим за изменениями в сообщениях, чтобы прокручивать чат вниз
watch(() => messages.length, () => {
    scrollToBottom();
});

// Функция для сброса ошибок и повторной попытки загрузки
const retryLoadMessages = () => {
    if (selectedChatId.value) {
        error.value = "";
        selectChat(selectedChatId.value);
    }
};

// Открыть диалог подтверждения удаления всех чатов
const confirmDeleteAllChats = () => {
    deleteAllDialog.value.show = true;
};

// Удалить все чаты и все их сообщения
const deleteAllChats = async () => {
    deleteAllDialog.value.loading = true;
    try {
        const chatsRef = collection(db, "chats");
        const chatsSnapshot = await getDocs(chatsRef);

        // Firebase имеет ограничение на 500 операций в одном batch
        // Поэтому если у нас много чатов, мы должны разделить на несколько батчей
        const batchLimit = 450; // оставляем запас
        let operationCount = 0;
        let batch = writeBatch(db);

        // Для каждого чата
        for (const chatDoc of chatsSnapshot.docs) {
            const chatId = chatDoc.id;

            // Получаем сообщения чата
            const messagesRef = collection(db, "chats", chatId, "messages");
            const messagesSnapshot = await getDocs(messagesRef);

            // Удаляем каждое сообщение
            for (const messageDoc of messagesSnapshot.docs) {
                batch.delete(doc(db, "chats", chatId, "messages", messageDoc.id));
                operationCount++;

                // Если достигли лимита, выполняем batch и создаем новый
                if (operationCount >= batchLimit) {
                    await batch.commit();
                    batch = writeBatch(db);
                    operationCount = 0;
                }
            }

            // Удаляем сам чат
            batch.delete(doc(db, "chats", chatId));
            operationCount++;

            // Опять проверяем лимит
            if (operationCount >= batchLimit) {
                await batch.commit();
                batch = writeBatch(db);
                operationCount = 0;
            }
        }

        // Выполняем оставшиеся операции, если они есть
        if (operationCount > 0) {
            await batch.commit();
        }

        // Снимаем выбор всех чатов
        unselectChat();

        // Показываем уведомление об успешном удалении
        $q.notify({
            color: 'positive',
            message: 'Все чаты успешно удалены',
            icon: 'check_circle',
            timeout: 2000
        });

        deleteAllDialog.value.show = false;
    } catch (error) {
        console.error("Ошибка при удалении всех чатов:", error);
        $q.notify({
            color: 'negative',
            message: `Ошибка при удалении всех чатов: ${error.message || 'Неизвестная ошибка'}`,
            icon: 'error',
            timeout: 3000
        });
    } finally {
        deleteAllDialog.value.loading = false;
    }
};

onMounted(async () => {
    if (authStore.isAuthenticated && authStore.isAdmin) {
        await fetchChats();
    }
});
</script>

<style lang="scss">
.admin-chat-page {
    height: calc(100vh - 100px);
    display: flex;
    flex-direction: column;
}

.chat-wrapper {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.unified-admin-chat-container {
    width: 100%;
    display: flex;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    height: 80vh;
    max-height: 500px;
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

.chat-list-item {
    transition: background-color 0.2s;
    border-left: 3px solid transparent;

    &.q-item--active {
        border-left-color: var(--q-primary);
        background-color: #e3f2fd !important;
        color: #1976d2 !important;
    }

    &:hover {
        background-color: rgba(0, 0, 0, 0.03);
    }
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

.empty-chat,
.empty-chat-container {
    height: 100%;
    color: #bdbdbd;
}

/* Мобильный режим */
@media (max-width: 599px) {
    .admin-chat-page {
        padding: 8px !important;
    }

    .chat-wrapper {
        max-width: 100%;
        padding: 0;
    }

    .unified-admin-chat-container {
        flex-direction: column;
        border-radius: 8px;
    }

    .chat-list-panel {
        width: 100%;
        height: auto;
        max-height: 100%;
        border-right: none;
    }

    .chat-content-panel {
        height: 100%;
    }

    .message-bubble {
        max-width: 85%;
    }
}
</style>