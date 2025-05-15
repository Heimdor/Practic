/**
 * Хранилище состояния аутентификации
 *
 * Модуль управляет авторизацией пользователей, хранит состояние текущего
 * пользователя, его права доступа, и предоставляет методы для входа,
 * регистрации и выхода из системы.
 *
 * @file auth.js
 */
import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import {
  auth,
  db,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  collection,
  query,
  where,
  getDocs,
} from "src/boot/firebase";

export const useAuthStore = defineStore("auth", () => {
  /**
   * Состояние пользователя и авторизации
   */
  const user = ref(null); // Данные текущего пользователя
  const loading = ref(true); // Состояние загрузки
  const error = ref(""); // Сообщение об ошибке
  const userRole = ref(null); // Роль пользователя (admin/user)

  /**
   * Вычисляемые свойства для проверки статуса пользователя
   */
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => {
    return userRole.value === "admin";
  });

  /**
   * Проверка роли пользователя в базе данных
   *
   * Запрашивает информацию о пользователе из Firestore и устанавливает
   * соответствующую роль (admin/user)
   *
   * @param {string} userEmail - Email пользователя для проверки
   */
  const checkUserRole = async (userEmail) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.isAdmin) {
          userRole.value = "admin";
        } else {
          userRole.value = "user";
        }
      } else {
        userRole.value = "user";
      }
    } catch (err) {
      console.error("Ошибка при проверке роли пользователя:", err);
      userRole.value = "user";
    }
  };

  /**
   * Инициализация состояния аутентификации
   *
   * Проверяет, авторизован ли пользователь при запуске приложения,
   * и устанавливает соответствующие данные пользователя и его роль
   */
  const init = async () => {
    loading.value = true;
    try {
      const currentUser = await getCurrentUser();
      user.value = currentUser;

      if (currentUser) {
        await checkUserRole(currentUser.email);
      }
    } catch (err) {
      console.error("Ошибка инициализации аутентификации:", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Вход пользователя в систему
   *
   * Выполняет аутентификацию пользователя и проверяет его роль
   *
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise} Объект с данными пользователя при успешном входе
   * @throws {Error} Ошибка аутентификации
   */
  const login = async (email, password) => {
    loading.value = true;
    error.value = "";
    try {
      const userCredential = await loginUser(email, password);
      user.value = userCredential;

      // Проверяем, является ли пользователь администратором
      await checkUserRole(email);

      return userCredential;
    } catch (err) {
      console.error("Ошибка при входе:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Регистрация нового пользователя
   *
   * Создает новую учетную запись пользователя в Firebase Auth
   *
   * @param {string} email - Email для новой учетной записи
   * @param {string} password - Пароль для новой учетной записи
   * @returns {Promise} Объект с данными созданного пользователя
   * @throws {Error} Ошибка при регистрации
   */
  const register = async (email, password) => {
    loading.value = true;
    error.value = "";
    try {
      const userCredential = await registerUser(email, password);
      user.value = userCredential;

      // По умолчанию новые пользователи имеют роль 'user'
      userRole.value = "user";

      return userCredential;
    } catch (err) {
      console.error("Ошибка при регистрации:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Выход пользователя из системы
   *
   * Выполняет выход из учетной записи и очищает данные пользователя
   *
   * @throws {Error} Ошибка при выходе
   */
  const logout = async () => {
    loading.value = true;
    error.value = "";
    try {
      await logoutUser();
      user.value = null;
      userRole.value = null;
    } catch (err) {
      console.error("Ошибка при выходе:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Наблюдатель за изменением статуса аутентификации
   *
   * Firebase Auth автоматически вызывает эту функцию при изменении состояния
   * аутентификации пользователя (вход, выход, истечение сессии и т.д.)
   */
  auth.onAuthStateChanged(async (currentUser) => {
    user.value = currentUser;

    if (currentUser) {
      await checkUserRole(currentUser.email);
    } else {
      userRole.value = null;
    }

    loading.value = false;
  });

  // Возвращаем публичный API хранилища
  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    userRole,
    init,
    login,
    register,
    logout,
  };
});
