import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
  db,
  auth,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  limit,
  increment,
  writeBatch,
} from "src/boot/firebase";

export const useChatStore = defineStore("chat", () => {
  const messages = ref([]);
  const loading = ref(false);
  const error = ref("");
  const chatId = ref(null);
  const unreadCount = ref(0);

  // Ограничиваем количество сообщений для экономии бесплатных запросов
  const MESSAGE_LIMIT = 25;

  // Получить или создать чат для текущего пользователя
  const initChat = async () => {
    loading.value = true;
    error.value = "";
    try {
      const userId = auth.currentUser
        ? auth.currentUser.uid
        : "guest-" + Date.now();
      const userEmail = auth.currentUser
        ? auth.currentUser.email
        : "guest@example.com";

      // Проверяем, существует ли уже чат для пользователя
      if (auth.currentUser) {
        const chatsRef = collection(db, "chats");
        const q = query(chatsRef, where("userId", "==", userId), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Чат уже существует
          chatId.value = querySnapshot.docs[0].id;
          // Подписываемся на обновления сообщений
          subscribeToMessages();
        } else {
          // Чат не существует, но мы пока не создаем его
          // Он будет создан при отправке первого сообщения
          chatId.value = null;
        }
      } else {
        // Для неавторизованных пользователей тоже не создаем чат,
        // пока не будет отправлено сообщение
        chatId.value = null;
      }

      return chatId.value;
    } catch (err) {
      console.error("Ошибка инициализации чата:", err);
      error.value = err.message || "Ошибка при инициализации чата";
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Подписаться на обновления сообщений
  const subscribeToMessages = () => {
    if (!chatId.value) {
      console.error("No chat ID available");
      return null;
    }

    try {
      console.log(`Subscribing to messages for chat ID: ${chatId.value}`);

      // Правильно создаем ссылку на коллекцию сообщений
      const messagesRef = collection(db, "chats", chatId.value, "messages");

      // Создаем запрос к этой коллекции - важно использовать правильную сортировку
      const q = query(
        messagesRef,
        orderBy("timestamp", "asc") // Сортируем по возрастанию времени
      );

      // Устанавливаем слушатель изменений
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot || !snapshot.docs) {
            console.error("Invalid snapshot received");
            messages.value = [];
            return;
          }

          console.log(
            `Received ${snapshot.docs.length} messages from Firebase`
          );

          // Clear messages array first to ensure reactivity works
          messages.value = [];

          // Map the documents to message objects
          const newMessages = snapshot.docs
            .filter((doc) => doc && doc.exists())
            .map((doc) => {
              const data = doc.data();
              const messageObj = {
                id: doc.id,
                ...data,
                // Make sure timestamp is valid
                timestamp: data.timestamp || { toDate: () => new Date() },
              };
              console.log(`Message: ${messageObj.text.substring(0, 20)}...`);
              return messageObj;
            });

          // Debug output
          console.log(`Processed ${newMessages.length} messages`);

          // Important: set messages directly, don't modify it incrementally
          messages.value = [...newMessages];
          console.log(
            `Updated messages.value, now contains ${messages.value.length} items`
          );

          // Считаем непрочитанные сообщения от админа
          const newUnreadMessages = newMessages.filter(
            (msg) => !msg.isUser && !msg.readByUser
          ).length;

          if (newUnreadMessages > 0) {
            unreadCount.value = newUnreadMessages;
            // Если есть непрочитанные сообщения от админа, помечаем их как прочитанные
            markMessagesAsReadByUser();
          }
        },
        (err) => {
          console.error("Ошибка получения сообщений:", err);
          error.value = err.message || "Ошибка при получении сообщений";
        }
      );
    } catch (err) {
      console.error("Ошибка при подписке на сообщения:", err);
      error.value = err.message || "Ошибка при подписке на сообщения";
      return null;
    }
  };

  // Отправить сообщение - с автоматическим созданием чата, если его нет
  const sendMessage = async (text) => {
    try {
      // Если нет chatId, сначала создаем чат
      if (!chatId.value) {
        const userId = auth.currentUser
          ? auth.currentUser.uid
          : "guest-" + Date.now();
        const userEmail = auth.currentUser
          ? auth.currentUser.email
          : "guest@example.com";

        // Создаем новый чат
        const chatsRef = collection(db, "chats");
        const newChatRef = await addDoc(chatsRef, {
          userId: userId,
          userEmail: userEmail,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unreadByAdmin: 0,
          unreadByUser: 0,
          isGuest: !auth.currentUser,
        });

        chatId.value = newChatRef.id;

        // Подписываемся на обновления сообщений
        subscribeToMessages();
      }

      // Теперь отправляем сообщение в существующий чат
      const messagesRef = collection(db, "chats", chatId.value, "messages");
      const newMessage = {
        text,
        senderId: auth.currentUser ? auth.currentUser.uid : "guest",
        senderEmail: auth.currentUser
          ? auth.currentUser.email
          : "guest@example.com",
        isUser: true,
        timestamp: serverTimestamp(), // Серверная отметка времени для сохранения
        readByAdmin: false,
        readByUser: true, // Пользователь автоматически прочитал свое сообщение
      };

      // Добавляем сообщение в Firebase
      const docRef = await addDoc(messagesRef, newMessage);

      // Обновляем данные о чате
      const chatRef = doc(db, "chats", chatId.value);
      await updateDoc(chatRef, {
        updatedAt: serverTimestamp(),
        lastMessage: text,
        unreadByAdmin: increment(1), // Увеличиваем счетчик непрочитанных для админа
      });

      console.log("Сообщение отправлено успешно, ID:", docRef.id);
      return true;
    } catch (err) {
      console.error("Ошибка отправки сообщения:", err);
      error.value = err.message;
      return false;
    }
  };

  // Пометить сообщения как прочитанные пользователем
  const markMessagesAsReadByUser = async () => {
    if (!chatId.value || !auth.currentUser) return;

    try {
      // Получаем идентификаторы непрочитанных сообщений от админа
      const unreadMsgs = messages.value
        .filter((msg) => !msg.isUser && !msg.readByUser)
        .map((msg) => msg.id);

      // Обновляем каждое сообщение
      for (const msgId of unreadMsgs) {
        const msgRef = doc(db, "chats", chatId.value, "messages", msgId);
        await updateDoc(msgRef, {
          readByUser: true,
        });
      }

      // Обновляем счетчик непрочитанных в чате
      if (unreadMsgs.length > 0) {
        const chatRef = doc(db, "chats", chatId.value);
        await updateDoc(chatRef, {
          unreadByUser: 0,
        });
        unreadCount.value = 0;
      }
    } catch (err) {
      console.error("Ошибка при отметке сообщений как прочитанных:", err);
    }
  };

  // Очистить состояние чата
  const resetChat = () => {
    console.log("Resetting chat state");
    messages.value = [];
    error.value = "";
    chatId.value = null;
    unreadCount.value = 0;
  };

  // Удалить чат и все его сообщения
  const deleteChat = async (chatIdToDelete) => {
    const targetChatId = chatIdToDelete || chatId.value;
    if (!targetChatId) {
      error.value = "Не удалось определить ID чата для удаления";
      return false;
    }

    try {
      // Создаем batch для атомарных операций
      const batch = writeBatch(db);

      // 1. Получаем все сообщения чата
      const messagesRef = collection(db, "chats", targetChatId, "messages");
      const messagesSnapshot = await getDocs(messagesRef);

      // 2. Добавляем в batch операции удаления каждого сообщения
      messagesSnapshot.docs.forEach((messageDoc) => {
        batch.delete(doc(db, "chats", targetChatId, "messages", messageDoc.id));
      });

      // 3. Добавляем в batch операцию удаления самого чата
      batch.delete(doc(db, "chats", targetChatId));

      // 4. Выполняем все операции атомарно
      await batch.commit();

      // 5. Если удален текущий чат, очищаем состояние
      if (targetChatId === chatId.value) {
        resetChat();
      }

      return true;
    } catch (err) {
      console.error("Ошибка при удалении чата:", err);
      error.value = err.message || "Ошибка при удалении чата";
      return false;
    }
  };

  // Получение информации о текущем состоянии чата для отладки
  const getChatDebugInfo = () => {
    return {
      chatId: chatId.value,
      messagesCount: messages.value.length,
      loading: loading.value,
      error: error.value,
      unreadCount: unreadCount.value,
    };
  };

  return {
    messages,
    loading,
    error,
    chatId,
    unreadCount,
    initChat,
    sendMessage,
    markMessagesAsReadByUser,
    resetChat,
    deleteChat,
    getChatDebugInfo,
  };
});
