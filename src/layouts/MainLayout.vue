<!-- 
  MainLayout.vue
  Основной макет приложения, содержащий шапку, навигационное меню, корзину и футер.
  
  Возможности компонента:
  - Адаптивное навигационное меню с различным отображением для разных ролей пользователей
  - Интерактивная корзина с возможностью управления товарами
  - Динамические счетчики для корзины и избранного
  - Поддержка адаптивной верстки для мобильных устройств
-->
<template>
  <!-- Используем sticky-footer layout с флагом F (fixed) для футера -->
  <q-layout view="lHh Lpr lFf" class="main-layout">
    <!-- Шапка сайта -->
    <q-header elevated class="bg-gradient-primary">
      <q-toolbar>
        <!-- Кнопка меню (скрыта на лендинге и странице входа для неавторизованных) -->
        <q-btn v-if="!isLandingOrLoginForAnonymous" flat dense round icon="menu" aria-label="Menu"
          @click="toggleLeftDrawer" class="q-mr-sm text-white" />

        <!-- Логотип по центру -->
        <div class="col text-center">
          <div class="store-logo">
            <span class="text-h5 text-white store-name">Fantasy Shop</span>
          </div>
        </div>

        <q-space />

        <!-- Кнопка избранного (скрыта на лендинге и странице входа для неавторизованных) -->
        <q-btn v-if="!isLandingOrLoginForAnonymous" flat round dense icon="favorite_border" aria-label="Избранное"
          to="/favorites" class="text-white favorites-button q-mr-sm">
          <q-badge v-if="favoritesCount > 0" color="negative" floating class="favorites-badge">
            {{ favoritesCount }}
          </q-badge>
        </q-btn>

        <!-- Иконка корзины (скрыта на лендинге и странице входа для неавторизованных) -->
        <q-btn v-if="!isLandingOrLoginForAnonymous" ref="cartButton" flat round dense icon="shopping_cart"
          aria-label="Корзина" @click="cartOpen = !cartOpen" class="text-white cart-button">
          <q-badge v-if="cartItemsCount > 0" color="negative" floating class="cart-badge">
            {{ cartItemsCount }}
          </q-badge>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Боковое меню -->
    <q-drawer v-model="leftDrawerOpen" bordered class="bg-gradient-primary text-white full-height" :width="280"
      :breakpoint="1024">
      <q-scroll-area class="full-height">
        <q-list padding>
          <q-item-label header class="text-white q-pb-md">Меню</q-item-label>

          <!-- Домашняя страница -->
          <q-item clickable v-ripple to="/catalog" class="text-white">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Главная</q-item-section>
          </q-item>

          <!-- Каталог товаров -->
          <q-item clickable v-ripple to="/catalog" class="text-white">
            <q-item-section avatar>
              <q-icon name="shopping_bag" />
            </q-item-section>
            <q-item-section>Каталог</q-item-section>
          </q-item>

          <!-- Избранное -->
          <q-item clickable v-ripple to="/favorites" class="text-white">
            <q-item-section avatar>
              <q-icon name="favorite" />
            </q-item-section>
            <q-item-section>
              <div class="row items-center">
                <div>Избранное</div>
                <q-badge v-if="favoritesCount > 0" color="negative" class="q-ml-sm menu-cart-badge">
                  {{ favoritesCount }}
                </q-badge>
              </div>
            </q-item-section>
          </q-item>

          <!-- Профиль (только для авторизованных) -->
          <q-item v-if="authStore.isAuthenticated" clickable v-ripple to="/profile" class="text-white">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>Профиль</q-item-section>
          </q-item>

          <!-- Чат (только для авторизованных не-админов) -->
          <q-item v-if="authStore.isAuthenticated && !authStore.isAdmin" clickable v-ripple to="/chat"
            class="text-white">
            <q-item-section avatar>
              <q-icon name="chat" />
            </q-item-section>
            <q-item-section>
              <div class="row items-center">
                <div>Чат с поддержкой</div>
                <q-badge v-if="chatStore.unreadCount > 0" color="accent" class="q-ml-sm menu-cart-badge">
                  {{ chatStore.unreadCount }}
                </q-badge>
              </div>
            </q-item-section>
          </q-item>

          <!-- Админские пункты меню -->
          <template v-if="authStore.isAdmin">
            <q-item clickable v-ripple to="/admin" class="text-white">
              <q-item-section avatar>
                <q-icon name="admin_panel_settings" />
              </q-item-section>
              <q-item-section>Администратор</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/chats" class="text-white">
              <q-item-section avatar>
                <q-icon name="support_agent" />
              </q-item-section>
              <q-item-section>Чаты поддержки</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/orders" class="text-white">
              <q-item-section avatar>
                <q-icon name="shopping_bag" />
              </q-item-section>
              <q-item-section>Заказы</q-item-section>
            </q-item>
          </template>

          <!-- Корзина (скрыта на лендинге и странице входа для неавторизованных) -->
          <q-item v-if="!isLandingOrLoginForAnonymous" clickable v-ripple @click="toggleCart" class="text-white">
            <q-item-section avatar>
              <q-icon name="shopping_cart" />
            </q-item-section>
            <q-item-section>
              <div class="row items-center">
                <div>Корзина</div>
                <q-badge v-if="cartItemsCount > 0" color="negative" class="q-ml-sm menu-cart-badge">
                  {{ cartItemsCount }}
                </q-badge>
              </div>
            </q-item-section>
          </q-item>

          <q-separator dark class="q-my-md" />

          <!-- Кнопки входа/выхода -->
          <q-item v-if="!authStore.isAuthenticated" clickable v-ripple to="/login" class="text-white">
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section>Вход</q-item-section>
          </q-item>
          <q-item v-else clickable v-ripple @click="handleLogout" class="text-white">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>Выход</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Основной контент -->
    <q-page-container class="flex-container">
      <router-view />
    </q-page-container>

    <!-- Футер -->
    <q-footer class="fantasy-footer text-white">
      <div class="page-container">
        <div class="row justify-between items-center q-py-sm">
          <div class="col-12 col-sm-4 text-center text-sm-left">
            <div class="text-subtitle2 footer-logo">Fantasy Shop</div>
            <div class="text-caption">Магазин волшебных товаров</div>
          </div>
          <div class="col-12 col-sm-4 text-center q-my-sm q-my-sm-none">
            <div class="text-caption">© 2025 Все права защищены</div>
          </div>
          <div class="col-12 col-sm-4 text-center text-sm-right">
            <div class="row justify-center justify-sm-end q-gutter-xs">
              <q-btn flat round dense color="white" icon="mail" href="mailto:support@myshop.com">
                <q-tooltip>Напишите нам</q-tooltip>
              </q-btn>
              <q-btn flat round dense color="white" icon="telegram" href="https://t.me/Heimdor" target="_blank">
                <q-tooltip>Telegram: @Heimdor</q-tooltip>
              </q-btn>
              <q-btn flat round dense color="white" icon="help" to="/faq">
                <q-tooltip>Часто задаваемые вопросы</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </q-footer>

    <!-- Всплывающее окно корзины -->
    <q-dialog v-model="cartOpen" position="right" :maximized="isSmallScreen">
      <q-card class="cart-card rounded-card shadow-medium compact-cart" :style="isSmallScreen ? 'width: 100%' : ''">
        <q-card-section class="bg-gradient-primary text-white cart-header rounded-top q-py-xs">
          <div class="text-center relative-position full-width">
            <div class="absolute-left" style="left: 10px; top: 2px;">
              <q-btn flat round dense icon="close" size="sm" color="white" v-close-popup class="cart-close-btn" />
            </div>
            <div class="row items-center justify-center">
              <q-icon name="shopping_cart" size="16px" class="q-mr-xs" />
              <div class="text-subtitle2">Корзина</div>
            </div>
          </div>
        </q-card-section>

        <!-- Пустая корзина -->
        <q-card-section v-if="cartItems.length === 0" class="cart-empty q-py-md">
          <div class="text-center">
            <q-icon name="shopping_cart_off" size="2rem" color="grey-5" style="margin: 0 auto; display: block;" />
            <div class="text-subtitle2 q-mt-sm text-weight-medium">Корзина пуста</div>
            <div class="text-caption q-mt-xs">Добавьте товары для оформления заказа</div>
            <q-btn color="primary" label="В каталог" to="/catalog" flat
              class="q-mt-md btn-gradient-primary q-px-sm catalog-btn" v-close-popup />
          </div>
        </q-card-section>

        <!-- Список товаров в корзине -->
        <template v-else>
          <q-card-section class="q-pa-none cart-items-container">
            <q-scroll-area style="height: 320px; max-height: 60vh;">
              <q-list separator dense>
                <q-item v-for="item in cartItems" :key="item.id" class="cart-item q-py-xs">
                  <q-item-section avatar style="min-width: 40px">
                    <q-img :src="item.image || '/images/product-placeholder.svg'" spinner-color="primary"
                      style="width: 40px; height: 40px" :ratio="1" class="rounded-borders" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium text-body2 ellipsis">{{ item.name }}</q-item-label>
                    <q-item-label caption class="q-mt-xs">
                      <span class="text-primary text-weight-bold">{{ formatPrice(item.price) }} ₽</span>
                    </q-item-label>

                    <!-- Контролы количества -->
                    <div class="row items-center q-mt-xs quantity-controls">
                      <q-btn flat round dense color="grey-7" icon="remove" size="xs"
                        @click="updateCartItemQuantity(item.id, item.quantity - 1)" :disable="item.quantity <= 1" />
                      <span class="q-mx-xs text-caption">{{ item.quantity }}</span>
                      <q-btn flat round dense color="primary" icon="add" size="xs"
                        @click="updateCartItemQuantity(item.id, item.quantity + 1)" />
                      <div class="col"></div>
                      <span class="item-total text-caption">{{ formatPrice(item.price * item.quantity) }} ₽</span>
                    </div>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round dense icon="delete" color="grey-7" size="xs" @click="removeFromCart(item.id)"
                      class="cart-remove-btn">
                      <q-tooltip>Удалить</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </q-card-section>

          <q-separator />

          <!-- Футер корзины с итогами и кнопками -->
          <q-card-section class="cart-footer q-py-sm">
            <div class="row items-center q-mb-xs">
              <div class="col text-grey-7 text-caption">Всего товаров:</div>
              <div class="col-auto text-weight-medium text-caption">{{ cartItemsCount }}</div>
            </div>
            <div class="row items-center q-mb-sm">
              <div class="col text-grey-7 text-caption">Итого:</div>
              <div class="col-auto text-subtitle2 text-primary text-weight-bold">{{ formatPrice(cartTotalPrice) }} ₽
              </div>
            </div>
            <div class="row q-col-gutter-xs">
              <div class="col-12 col-sm-6">
                <q-btn outline dense color="grey-7" label="Очистить" class="full-width text-caption" @click="clearCart"
                  :ripple="false" />
              </div>
              <div class="col-12 col-sm-6">
                <q-btn dense label="Оформить заказ" class="full-width btn-gradient-primary text-caption"
                  @click="goToCheckout" :ripple="false" />
              </div>
            </div>
          </q-card-section>
        </template>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
/**
 * Основной компонент макета приложения Fantasy Shop
 * 
 * Отвечает за структурное размещение всех базовых элементов интерфейса:
 * шапки, бокового меню, контентной области и футера. Также включает
 * функциональность корзины товаров в виде модального окна.
 * 
 * @file MainLayout.vue
 * @author MyShop Team
 */
import { ref, computed, inject, onMounted, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import EssentialLink from "components/EssentialLink.vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { useChatStore } from "src/stores/chat";
import { useFavoritesStore } from 'src/stores/favorites';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const chatStore = useChatStore();
const favoritesStore = useFavoritesStore();

// Состояние интерфейса
const leftDrawerOpen = ref(false);
const cartOpen = ref(false);

/**
 * Инъекция функционала корзины из провайдера
 * Получаем доступ к состоянию и методам управления корзиной,
 * определенным в родительском компоненте через provide
 */
const cartItems = inject('cartItems', ref([]));
const cartItemsCount = inject('cartItemsCount', computed(() => 0));
const cartTotalPrice = inject('cartTotalPrice', computed(() => 0));
const removeFromCart = inject('removeFromCart', () => { });
const updateCartItemQuantity = inject('updateCartItemQuantity', () => { });
const clearCart = inject('clearCart', () => { });

/**
 * Получение количества товаров в избранном из хранилища
 */
const favoritesCount = computed(() => favoritesStore.favoritesCount);

/**
 * Определение режима отображения для разных размеров экрана
 * Используется для адаптации интерфейса под различные устройства
 */
const isMobile = computed(() => $q.screen.width < 800);
const isSmallScreen = computed(() => $q.screen.width < 600);

/**
 * Проверка, находится ли пользователь на лендинге или странице входа
 * и при этом не авторизован. Используется для скрытия определенных элементов
 * интерфейса для неавторизованных пользователей на этих страницах.
 */
const isLandingOrLoginForAnonymous = computed(() => (route.path === '/' || route.path === '/login') && !authStore.isAuthenticated);

/**
 * Фильтрация пунктов меню в зависимости от прав пользователя
 * Динамически формирует список доступных пунктов меню на основе роли пользователя
 */
const filteredLinks = computed(() => {
  return essentialLinks.filter(link => {
    // Для администратора не показываем обычный чат
    if (link.title === "Чат с поддержкой" && authStore.isAdmin) return false;

    // Для обычных пользователей не показываем админские ссылки
    if (link.adminOnly && !authStore.isAdmin) return false;

    // Для неавторизованного пользователя не показываем ссылки, требующие авторизации
    if (link.authRequired && !authStore.isAuthenticated) return false;

    return true;
  });
});

/**
 * Список пунктов навигационного меню
 * Каждый пункт содержит заголовок, подпись, иконку и ссылку
 * Некоторые пункты имеют дополнительные флаги для ограничения видимости
 */
const essentialLinks = [
  {
    title: "Главная",
    caption: "Домашняя страница",
    icon: "home",
    link: "/",
  },
  {
    title: "Каталог",
    caption: "Наши товары",
    icon: "shopping_bag",
    link: "/catalog",
  },
  {
    title: "Профиль",
    caption: "Личный кабинет",
    icon: "person",
    link: "/profile",
    authRequired: true
  },
  {
    title: "Чат с поддержкой",
    caption: "Задайте вопрос",
    icon: "chat",
    link: "/chat",
    badge: computed(() => chatStore.unreadCount > 0 ? chatStore.unreadCount : null)
  },
  {
    title: "Администратор",
    caption: "Управление товарами",
    icon: "admin_panel_settings",
    link: "/admin",
    adminOnly: true
  },
  {
    title: "Чаты поддержки",
    caption: "Ответы пользователям",
    icon: "support_agent",
    link: "/admin/chats",
    adminOnly: true
  },
  {
    title: "Заказы",
    caption: "Управление заказами",
    icon: "shopping_bag",
    link: "/orders",
    adminOnly: true
  },
];

/**
 * Переключение состояния бокового меню
 * Открывает или закрывает боковую панель навигации
 */
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

/**
 * Переключение отображения корзины
 * Открывает или закрывает модальное окно корзины
 */
const toggleCart = () => {
  cartOpen.value = !cartOpen.value;
};

/**
 * Переход к оформлению заказа
 * Закрывает корзину и перенаправляет пользователя на страницу оформления заказа
 */
const goToCheckout = () => {
  cartOpen.value = false;
  router.push('/checkout');
};

/**
 * Обработка выхода из аккаунта
 * Выполняет логаут пользователя, очищает корзину и перенаправляет на главную
 */
const handleLogout = async () => {
  try {
    await authStore.logout();
    // Очищаем корзину при выходе из аккаунта
    clearCart();
    $q.notify({
      color: 'positive',
      message: 'Вы успешно вышли из аккаунта',
      icon: 'check'
    });
    // Закрываем меню, если оно открыто
    leftDrawerOpen.value = false;
    // Перенаправляем на главную
    router.push('/');
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    $q.notify({
      color: 'negative',
      message: 'Ошибка при выходе из аккаунта',
      icon: 'error'
    });
  }
};

/**
 * Закрытие меню при изменении размера экрана
 * Автоматически закрывает боковое меню при переходе на большие экраны
 */
const handleResize = () => {
  if (!isMobile.value && leftDrawerOpen.value) {
    leftDrawerOpen.value = false;
  }
};

/**
 * Инициализация компонента при монтировании
 * Добавляет обработчик изменения размера окна и инициализирует аутентификацию
 */
onMounted(() => {
  authStore.init();
  window.addEventListener('resize', handleResize);
});

/**
 * Очистка обработчиков при уничтожении компонента
 * Предотвращает утечки памяти при удалении компонента
 */
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

/**
 * Форматирование цены для отображения
 * Преобразует числовое значение в строку с разделителем тысяч
 * @param {number} price - Сумма для форматирования
 * @returns {string} Отформатированная цена в российском формате
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};
</script>

<style scoped>
/* Стили для главного меню */
.q-drawer {
  background-image: linear-gradient(135deg, #2c1d54, #462b82) !important;
  height: 100%;
  min-height: 100vh;
}

.q-drawer .q-scroll-area {
  height: 100vh !important;
}

/* Стилизация кнопки корзины с анимацией */
.cart-button {
  transition: transform 0.3s ease;
  position: relative;
}

.cart-button:hover {
  transform: scale(1.1);
}

/* Оформление счетчика товаров в корзине */
.cart-badge {
  border-radius: 50%;
  font-size: 0.7rem;
  height: 18px;
  min-width: 18px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Стили для модального окна корзины */
.cart-menu {
  max-width: 90vw;
}

.cart-card {
  width: 340px;
  max-width: 100vw;
}

/* Компактная версия корзины */
.compact-cart {
  width: 320px !important;
}

/* Оформление заголовка корзины */
.cart-header {
  padding: 6px 12px;
}

/* Скругление верхних углов модального окна */
.rounded-top {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

/* Стили для пустой корзины */
.cart-empty {
  padding: 16px 0;
}

/* Контейнер для списка товаров */
.cart-items-container {
  padding: 0;
}

/* Футер корзины с итоговой информацией */
.cart-footer {
  padding: 8px 12px;
  background-color: #f8f8f8;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* Анимация при наведении на элемент корзины */
.cart-item {
  transition: background-color 0.3s;
  padding: 4px 12px;
}

.cart-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Контролы изменения количества товаров */
.quantity-controls {
  display: flex;
  align-items: center;
}

/* Стиль итоговой цены */
.item-total {
  font-weight: 500;
  color: var(--q-primary);
}

/* Кнопка удаления товара с анимацией */
.cart-remove-btn {
  opacity: 0.7;
  transition: all 0.3s;
}

.cart-remove-btn:hover {
  opacity: 1;
  color: var(--q-negative) !important;
  transform: scale(1.1);
}

/* Анимация при добавлении товара в корзину */
@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

.cart-item-added {
  animation: pulse 0.3s ease-in-out;
}

/* Оформление футера в фэнтезийном стиле */
.fantasy-footer {
  font-size: 11px;
  line-height: 1.1;
  padding: 4px 0;
  background: linear-gradient(135deg, #2a3040, #1a1f30);
  position: fixed;
  bottom: 0;
  width: 100%;
  overflow: hidden;
  min-height: 60px;
  z-index: 10;
}

/* Отступ для контента, чтобы не перекрывался футером */
.q-page-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 50px);
  padding-bottom: 70px !important;
}

/* Стилизация логотипа в футере */
.footer-logo {
  font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
  letter-spacing: 0.5px;
  background: linear-gradient(to right, #ffffff, #c9d9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1rem;
  margin-bottom: 2px;
}

/* Кнопки футера */
.fantasy-footer .q-btn {
  min-height: 24px;
  width: 24px;
  height: 24px;
  padding: 0;
  transition: all 0.2s ease;
}

.fantasy-footer .q-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 8px rgba(120, 85, 245, 0.4);
}

/* Логотип магазина в шапке */
.store-logo {
  display: inline-block;
  padding: 0 12px;
  position: relative;
}

.store-name {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  color: #e9c46a;
}

.store-logo:hover .store-name {
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 10px rgba(233, 196, 106, 0.5);
  transform: translateY(-2px);
}

.text-decoration-none {
  text-decoration: none;
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 599px) {
  .store-name {
    font-size: 1.25rem !important;
  }

  .cart-card {
    width: 100%;
    border-radius: 0;
  }

  .cart-item {
    padding: 6px 12px;
  }

  .cart-footer {
    padding: 8px 12px;
  }

  .fantasy-footer {
    padding: 3px 0;
    min-height: 50px;
  }

  .q-page-container {
    padding-bottom: 60px !important;
  }

  /* Улучшенная верстка элементов корзины на мобильных */
  .quantity-controls {
    flex-wrap: wrap;
    margin-top: 6px;
  }

  .quantity-controls .q-btn {
    min-width: 28px;
    padding: 2px;
  }

  .item-total {
    margin-top: 2px;
    font-size: 0.8rem;
  }

  .cart-remove-btn {
    margin-top: 0;
  }
}

/* Стилизация счетчика в меню */
.menu-cart-badge {
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: bold;
}

/* Стили для правильного позиционирования футера */
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.flex-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
}

/* Обеспечение полной высоты меню */
.full-height {
  height: 100% !important;
}

/* Стилизация кнопки закрытия корзины */
.cart-close-btn {
  opacity: 0.9;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.6);
  min-height: 24px;
  width: 24px !important;
  height: 24px !important;
}

.cart-close-btn::before {
  font-size: 14px;
}

.cart-close-btn:hover {
  opacity: 1;
  transform: scale(1.05);
  border: 1px solid rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.2);
}

/* Стилизация кнопки перехода в каталог из пустой корзины */
.catalog-btn {
  border: 1px solid var(--q-primary);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.catalog-btn:hover {
  background: rgba(var(--q-primary-rgb), 0.1);
  transform: translateY(-1px);
}
</style>
