/**
 * Модуль управления избранными товарами
 *
 * Хранилище предоставляет функциональность для добавления, удаления и отслеживания
 * избранных товаров пользователя. Данные сохраняются в localStorage для
 * персистентности между сессиями.
 *
 * @file favorites.js
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useFavoritesStore = defineStore("favorites", () => {
  /**
   * Массив объектов избранных товаров
   * Каждый товар содержит полную информацию о продукте (id, название, цена, изображение и т.д.)
   */
  const favoriteItems = ref([]);

  /**
   * Вычисляемое свойство для получения количества избранных товаров
   * Используется для отображения счетчиков в интерфейсе
   */
  const favoritesCount = computed(() => favoriteItems.value.length);

  /**
   * Инициализация списка избранных товаров из localStorage
   * Вызывается при создании хранилища для восстановления данных из предыдущих сессий
   */
  const initFavorites = () => {
    const savedFavorites = localStorage.getItem("favoriteItems");
    if (savedFavorites) {
      try {
        favoriteItems.value = JSON.parse(savedFavorites);
      } catch (e) {
        console.error(
          "Ошибка при загрузке избранных товаров из localStorage:",
          e
        );
        favoriteItems.value = [];
      }
    }
  };

  /**
   * Сохранение текущего списка избранных товаров в localStorage
   * Вызывается автоматически после каждой операции изменения списка
   */
  const saveFavoritesToLocalStorage = () => {
    localStorage.setItem("favoriteItems", JSON.stringify(favoriteItems.value));
  };

  /**
   * Добавление товара в список избранного
   * Проверяет наличие товара перед добавлением для избежания дубликатов
   *
   * @param {Object} product - Объект товара для добавления в избранное
   */
  const addToFavorites = (product) => {
    // Проверяем, есть ли уже товар в избранном
    if (!isInFavorites(product.id)) {
      favoriteItems.value.push(product);
      saveFavoritesToLocalStorage();
    }
  };

  /**
   * Удаление товара из списка избранного по идентификатору
   *
   * @param {string|number} productId - Идентификатор товара для удаления
   */
  const removeFromFavorites = (productId) => {
    const index = favoriteItems.value.findIndex(
      (item) => item.id === productId
    );
    if (index !== -1) {
      favoriteItems.value.splice(index, 1);
      saveFavoritesToLocalStorage();
    }
  };

  /**
   * Проверка наличия товара в списке избранного
   * Используется для условного отображения UI-элементов и предотвращения дубликатов
   *
   * @param {string|number} productId - Идентификатор товара для проверки
   * @returns {boolean} true, если товар находится в избранном, иначе false
   */
  const isInFavorites = (productId) => {
    return favoriteItems.value.some((item) => item.id === productId);
  };

  /**
   * Полная очистка списка избранных товаров
   * Удаляет все товары из избранного и обновляет localStorage
   */
  const clearFavorites = () => {
    favoriteItems.value = [];
    saveFavoritesToLocalStorage();
  };

  /**
   * Переключение статуса товара в избранном
   * Если товар уже в избранном - удаляет его, иначе добавляет
   * Удобно для использования с кнопкой-переключателем в UI
   *
   * @param {Object} product - Объект товара для переключения статуса
   */
  const toggleFavorite = (product) => {
    if (isInFavorites(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  // Инициализация при создании хранилища
  initFavorites();

  // Публичный API хранилища
  return {
    favoriteItems,
    favoritesCount,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    clearFavorites,
    toggleFavorite,
  };
});
