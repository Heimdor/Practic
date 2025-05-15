<!-- 
  Profile.vue
  Компонент страницы профиля пользователя.
  
  Функциональность:
  - Отображение информации о пользователе
  - История заказов пользователя
  - Детальный просмотр заказов
  - Статус администратора (если применимо)
-->
<template>
  <q-page padding>
    <div class="page-container">
      <!-- Заголовок страницы -->
      <div class="header-section q-mb-lg bg-gradient-primary rounded-borders shadow-soft">
        <h4 class="q-pa-md text-white q-mb-none">Профиль пользователя</h4>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="authStore.loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="50px" />
        <div class="text-subtitle1 q-mt-md">Загрузка данных...</div>
      </div>

      <!-- Ошибка аутентификации -->
      <div v-else-if="!authStore.user" class="text-center q-py-xl card-gradient-light rounded-card q-pa-lg shadow-soft">
        <q-icon name="error" color="negative" size="50px" />
        <div class="text-subtitle1 q-mt-md">Ошибка загрузки профиля</div>
        <q-btn color="primary" label="Войти" to="/login" class="q-mt-md btn-gradient-primary" />
      </div>

      <!-- Содержимое профиля -->
      <div v-else class="row q-col-gutter-lg">
        <!-- Информация о пользователе -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-mb-md rounded-card shadow-soft card-gradient-light">
            <q-card-section class="bg-gradient-secondary text-white rounded-top">
              <div class="text-h6">
                <q-icon name="person" class="q-mr-sm" />
                Данные пользователя
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-avatar color="secondary" text-color="white">
                      <q-icon name="email" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Email</q-item-label>
                    <q-item-label>{{ authStore.user.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-avatar color="secondary" text-color="white">
                      <q-icon name="timer" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Дата регистрации</q-item-label>
                    <q-item-label>{{ formatDate(authStore.user.metadata?.creationTime) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-avatar color="secondary" text-color="white">
                      <q-icon name="verified" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Статус</q-item-label>
                    <q-item-label>
                      <q-chip v-if="authStore.isAdmin" class="bg-gradient-accent" text-color="white"
                        label="Администратор" />
                      <q-chip v-else class="bg-gradient-primary" text-color="white" label="Пользователь" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <!-- История заказов -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-mb-md rounded-card shadow-soft card-gradient-light">
            <q-card-section class="bg-gradient-primary text-white rounded-top">
              <div class="text-h6">
                <q-icon name="shopping_bag" class="q-mr-sm" />
                История заказов
              </div>
            </q-card-section>

            <q-separator />

            <!-- Загрузка заказов -->
            <q-card-section v-if="orders.loading" class="text-center q-py-md">
              <q-spinner color="primary" size="2em" />
              <div class="q-mt-sm">Загрузка заказов...</div>
            </q-card-section>

            <!-- Нет заказов -->
            <q-card-section v-else-if="orders.items.length === 0" class="text-center q-py-md">
              <q-icon name="shopping_bag" color="grey-5" size="3rem" />
              <div class="text-subtitle1 q-mt-md">У вас пока нет заказов</div>
              <q-btn color="primary" label="Перейти в каталог" to="/" class="q-mt-md btn-gradient-primary" flat />
            </q-card-section>

            <!-- Список заказов -->
            <template v-else>
              <q-list separator>
                <q-item v-for="order in orders.items" :key="order.id" clickable @click="viewOrderDetails(order)"
                  class="order-item hover-scale">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">Заказ #{{ formatOrderId(order.id) }}</q-item-label>
                    <q-item-label caption>{{ formatDate(order.createdAt) }}</q-item-label>
                    <q-item-label caption class="q-mt-xs">
                      <q-icon name="inventory_2" size="xs" class="q-mr-xs" />
                      Товары: {{ order.totalItems }} |
                      <q-icon name="payments" size="xs" class="q-mr-xs q-ml-sm" />
                      Сумма: {{ formatPrice(order.total) }} ₽
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip :color="getStatusColor(order.status)" text-color="white" :label="order.status" />
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Диалог просмотра заказа -->
    <q-dialog v-model="orderDialog" persistent>
      <q-card style="width: 700px; max-width: 95vw;" class="rounded-card shadow-medium">
        <q-card-section class="row items-center bg-gradient-primary text-white rounded-top">
          <div class="text-h6">
            <q-icon name="shopping_bag" class="q-mr-sm" />
            Заказ #{{ formatOrderId(selectedOrder?.id) }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup text-color="white" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="selectedOrder">
          <div class="row q-col-gutter-md">
            <!-- Информация о заказе -->
            <div class="col-12">
              <q-card flat bordered class="shadow-soft card-gradient-light rounded-card">
                <q-card-section class="bg-gradient-secondary text-white rounded-top">
                  <div class="text-subtitle2">
                    <q-icon name="info" class="q-mr-sm" />
                    Информация о заказе
                  </div>
                </q-card-section>
                <q-card-section>
                  <q-list dense>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="event" color="secondary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Дата заказа</q-item-label>
                        <q-item-label>{{ formatDate(selectedOrder.createdAt) }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="info" color="secondary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Статус</q-item-label>
                        <q-item-label>
                          <q-chip :color="getStatusColor(selectedOrder.status)" text-color="white"
                            :label="selectedOrder.status" dense />
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="selectedOrder.status === 'отменен' && selectedOrder.cancelReason">
                      <q-item-section avatar>
                        <q-icon name="cancel" color="negative" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Причина отмены</q-item-label>
                        <q-item-label class="text-negative">{{ selectedOrder.cancelReason }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="payment" color="secondary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Способ оплаты</q-item-label>
                        <q-item-label>{{ getPaymentMethodLabel(selectedOrder.paymentMethod) }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <!-- Товары в заказе -->
            <div class="col-12">
              <q-card flat bordered class="shadow-soft card-gradient-light rounded-card q-mt-md">
                <q-card-section class="bg-gradient-accent text-white rounded-top">
                  <div class="text-subtitle2">
                    <q-icon name="inventory_2" class="q-mr-sm" />
                    Товары
                  </div>
                </q-card-section>
                <q-card-section>
                  <q-list separator>
                    <q-item v-for="item in selectedOrder.items" :key="item.id">
                      <q-item-section avatar>
                        <q-avatar square size="50px" class="product-image">
                          <img :src="getProductImage(item)" alt="Product image" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">{{ item.name }}</q-item-label>
                        <q-item-label caption>{{ formatPrice(item.price) }} ₽ × {{ item.quantity }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="text-weight-medium text-primary">
                          {{ formatPrice(item.totalPrice) }} ₽
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <div class="q-mt-md">
                    <div class="row items-center q-mb-sm">
                      <div class="col text-body1">Товары ({{ selectedOrder.totalItems }})</div>
                      <div class="col-auto text-body1 text-weight-medium">{{ formatPrice(selectedOrder.subtotal) }} ₽
                      </div>
                    </div>
                    <div class="row items-center q-mb-sm">
                      <div class="col text-body1">Доставка</div>
                      <div class="col-auto text-body1 text-weight-medium">{{ formatPrice(selectedOrder.deliveryCost) }}
                        ₽
                      </div>
                    </div>
                    <q-separator class="q-my-md" />
                    <div class="row items-center q-mb-sm text-primary">
                      <div class="col text-body1 text-weight-medium">Итого</div>
                      <div class="col-auto text-h6 text-weight-bold">{{ formatPrice(selectedOrder.total) }} ₽</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { ordersCollection, db } from 'src/boot/firebase';
import { query, where, getDocs } from 'firebase/firestore';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const authStore = useAuthStore();

/**
 * Состояние для заказов пользователя
 */
const orders = reactive({
  items: [],
  loading: true,
  error: null
});

/**
 * Состояние для просмотра заказа
 */
const orderDialog = ref(false);
const selectedOrder = ref(null);

/**
 * Форматирование идентификатора заказа
 * @param {string} id - Идентификатор заказа
 * @returns {string} Форматированный ID
 */
const formatOrderId = (id) => {
  return id ? id.substring(0, 8).toUpperCase() : '';
};

/**
 * Форматирование даты
 * @param {Date|object} timestamp - Временная метка (Firebase Timestamp или JS Date)
 * @returns {string} Форматированная дата
 */
const formatDate = (timestamp) => {
  if (!timestamp) return 'Н/Д';

  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return 'Н/Д';
  }
};

/**
 * Форматирование цены
 * @param {number} price - Цена
 * @returns {string} Форматированная цена
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price || 0);
};

/**
 * Получение цвета для статуса заказа
 * @param {string} status - Статус заказа
 * @returns {string} Название цвета
 */
const getStatusColor = (status) => {
  switch (status) {
    case 'новый': return 'blue';
    case 'подтвержден': return 'teal';
    case 'в обработке': return 'orange';
    case 'отправлен': return 'purple';
    case 'доставлен': return 'positive';
    case 'отменен': return 'negative';
    default: return 'grey';
  }
};

/**
 * Получение названия способа оплаты
 * @param {string} method - Код способа оплаты
 * @returns {string} Название способа оплаты
 */
const getPaymentMethodLabel = (method) => {
  switch (method) {
    case 'card': return 'Банковской картой онлайн';
    case 'cash': return 'Наличными при получении';
    default: return method || 'Не указан';
  }
};

/**
 * Получение изображения продукта (заглушка, если изображение отсутствует)
 * @param {object} item - Объект продукта
 * @returns {string} URL изображения
 */
const getProductImage = (item) => {
  return item.image || '/images/product-placeholder.svg';
};

/**
 * Загрузка заказов пользователя
 */
const fetchUserOrders = async () => {
  if (!authStore.user || !authStore.user.email) return;

  orders.loading = true;
  orders.error = null;

  try {
    // Запрос заказов по email пользователя
    const userOrdersQuery = query(
      ordersCollection,
      where('customer.email', '==', authStore.user.email)
    );

    const snapshot = await getDocs(userOrdersQuery);
    orders.items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Сортировка по дате (новые сверху)
    orders.items.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
  } catch (err) {
    console.error('Ошибка при загрузке заказов пользователя:', err);
    orders.error = 'Не удалось загрузить историю заказов';

    $q.notify({
      color: 'negative',
      message: 'Не удалось загрузить данные заказов',
      icon: 'error'
    });
  } finally {
    orders.loading = false;
  }
};

/**
 * Просмотр деталей заказа
 * @param {object} order - Объект заказа
 */
const viewOrderDetails = (order) => {
  selectedOrder.value = order;
  orderDialog.value = true;
};

// Загрузка данных при монтировании компонента
onMounted(async () => {
  // Инициализируем аутентификацию, если не была инициализирована
  if (!authStore.user && !authStore.loading) {
    await authStore.init();
  }

  // Ожидаем инициализации аутентификации
  if (authStore.loading) {
    await new Promise(resolve => {
      const unwatch = watch(() => authStore.loading, (loading) => {
        if (!loading) {
          unwatch();
          resolve();
        }
      });
    });
  }

  // Загружаем заказы пользователя
  if (authStore.isAuthenticated) {
    fetchUserOrders();
  }
});
</script>

<style scoped>
/* Стили для страницы профиля */
.header-section {
  position: relative;
  overflow: hidden;
  padding: 8px 16px;
  border-radius: 8px;
}

.header-section::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 30%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1));
  transform: skewX(-15deg);
}

.rounded-top {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

/* Стили для карточек */
.order-item {
  transition: all 0.3s ease;
}

.order-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Стили для изображений продуктов */
.product-image {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f5f5;
}
</style>
