<template>
  <q-page padding>
    <!-- Заголовок страницы -->
    <div class="page-container">
      <div class="header-section q-mb-lg bg-gradient-primary rounded-borders shadow-soft">
        <h4 class="q-pa-md text-white q-mb-none">Управление заказами</h4>
      </div>

      <!-- Загрузка и ошибки -->
      <div v-if="loading" class="text-center q-py-lg">
        <q-spinner-dots color="primary" size="40px" />
        <div class="q-mt-sm text-grey-8">Загрузка данных...</div>
      </div>

      <div v-else-if="error" class="text-center q-py-lg card-gradient-light rounded-card q-pa-md shadow-soft">
        <q-icon name="error" color="negative" size="2rem" />
        <div class="q-mt-sm text-grey-8">{{ error }}</div>
        <q-btn unelevated color="primary" label="Повторить" @click="fetchOrders" class="q-mt-sm btn-gradient-primary" />
      </div>

      <!-- Список заказов -->
      <div v-else-if="orders.length > 0" class="rounded-card shadow-soft">
        <q-table :rows="orders" :columns="columns" row-key="id" :pagination="{ rowsPerPage: 10 }" class="orders-table">
          <template v-slot:body="props">
            <q-tr :props="props" class="order-row">
              <q-td key="id" :props="props">{{
                formatOrderId(props.row.id)
              }}</q-td>
              <q-td key="customer" :props="props">
                <div class="text-weight-medium">
                  {{ props.row.customer.firstName }}
                  {{ props.row.customer.lastName }}
                </div>
                <small class="text-grey">{{ props.row.customer.email }}<br />{{
                  props.row.customer.phone
                  }}</small>
              </q-td>
              <q-td key="date" :props="props">
                {{ formatDate(props.row.createdAt) }}
              </q-td>
              <q-td key="items" :props="props">{{ props.row.totalItems }}</q-td>
              <q-td key="total" :props="props">{{ formatPrice(props.row.total) }} ₽</q-td>
              <q-td key="status" :props="props">
                <q-chip :color="getStatusColor(props.row.status)" text-color="white" :label="props.row.status"
                  class="status-chip" />
              </q-td>
              <q-td key="actions" :props="props">
                <div class="row q-gutter-x-sm justify-center">
                  <q-btn flat round dense color="primary" icon="visibility" @click="viewOrder(props.row)"
                    class="action-btn">
                    <q-tooltip>Просмотр</q-tooltip>
                  </q-btn>

                  <!-- Быстрые действия для заказов в статусе "новый" -->
                  <template v-if="props.row.status === 'новый'">
                    <q-btn flat round dense color="positive" icon="check_circle" @click="quickConfirmOrder(props.row)"
                      class="action-btn">
                      <q-tooltip>Подтвердить заказ</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense color="negative" icon="cancel" @click="quickCancelOrder(props.row)"
                      class="action-btn">
                      <q-tooltip>Отменить заказ</q-tooltip>
                    </q-btn>
                  </template>

                  <!-- Кнопка для других статусов -->
                  <q-btn flat round dense color="orange" icon="edit" @click="changeStatus(props.row)"
                    class="action-btn">
                    <q-tooltip>Изменить статус</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>

      <!-- Нет заказов -->
      <div v-else class="text-center q-py-lg card-gradient-light rounded-card q-pa-lg shadow-soft">
        <q-icon name="shopping_bag" color="grey-5" size="4rem" />
        <div class="text-h6 q-mt-md">Заказы отсутствуют</div>
        <div class="text-body1 q-mt-sm text-grey-7">
          Пока нет ни одного оформленного заказа
        </div>
      </div>
    </div>

    <!-- Диалог просмотра заказа -->
    <q-dialog v-model="viewDialog" maximized>
      <q-card class="order-detail-card">
        <q-card-section class="row items-center bg-gradient-primary text-white q-py-sm">
          <div class="text-subtitle1 q-ml-sm">
            <q-icon name="receipt_long" size="xs" class="q-mr-xs" />
            Заказ №{{ formatOrderId(selectedOrder?.id) }}
          </div>
          <q-space />
          <q-btn dense flat round icon="close" v-close-popup text-color="white" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="selectedOrder" class="q-pa-xs q-ma-none">
          <!-- Верхняя панель с кнопками действий -->
          <div class="row q-mb-xs justify-end">
            <div class="text-caption text-grey">Статус:</div>
            <q-chip :color="getStatusColor(selectedOrder.status)" text-color="white" dense size="sm" class="q-ml-sm">
              {{ selectedOrder.status }}
            </q-chip>
            <q-space />
            <q-btn flat dense color="orange" icon="edit" label="Изменить статус" size="sm"
              @click="changeStatus(selectedOrder)" class="q-ml-sm" />
          </div>

          <q-scroll-area style="height: calc(100vh - 100px);">
            <div class="row q-col-gutter-xs">
              <!-- Блок информации о клиенте и заказе -->
              <div class="col-12 col-md-12">
                <q-card flat bordered class="compact-card">
                  <q-card-section class="q-py-xs row items-center bg-gradient-primary text-white">
                    <q-icon name="info" size="xs" class="q-mr-xs" />
                    <div class="text-caption">Информация о заказе</div>
                  </q-card-section>

                  <q-card-section class="q-pa-xs">
                    <div class="row q-col-gutter-xs">
                      <div class="col-12 col-md-6">
                        <q-list dense class="q-pa-none">
                          <q-item dense class="q-py-none">
                            <q-item-section avatar>
                              <q-icon name="person" size="xs" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label caption>Клиент</q-item-label>
                              <q-item-label class="text-body2">{{ selectedOrder.customer.firstName }} {{
                                selectedOrder.customer.lastName }}</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item dense class="q-py-none">
                            <q-item-section avatar>
                              <q-icon name="email" size="xs" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label caption>Email</q-item-label>
                              <q-item-label class="text-body2">{{ selectedOrder.customer.email }}</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item dense class="q-py-none">
                            <q-item-section avatar>
                              <q-icon name="phone" size="xs" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label caption>Телефон</q-item-label>
                              <q-item-label class="text-body2">{{ selectedOrder.customer.phone }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </div>

                      <div class="col-12 col-md-6">
                        <q-list dense class="q-pa-none">
                          <q-item dense class="q-py-none">
                            <q-item-section avatar>
                              <q-icon name="event" size="xs" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label caption>Дата заказа</q-item-label>
                              <q-item-label class="text-body2">{{ formatDate(selectedOrder.createdAt) }}</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item dense class="q-py-none">
                            <q-item-section avatar>
                              <q-icon name="payment" size="xs" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label caption>Способ оплаты</q-item-label>
                              <q-item-label class="text-body2">{{ getPaymentMethodLabel(selectedOrder.paymentMethod)
                                }}</q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item dense v-if="selectedOrder.comment" class="q-py-none">
                            <q-item-section avatar>
                              <q-icon name="comment" size="xs" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label caption>Комментарий</q-item-label>
                              <q-item-label class="text-body2">{{ selectedOrder.comment }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Адрес доставки -->
              <div class="col-12">
                <q-card flat bordered class="compact-card q-mt-xs">
                  <q-card-section class="q-py-xs row items-center bg-gradient-primary text-white">
                    <q-icon name="home" size="xs" class="q-mr-xs" />
                    <div class="text-caption">Адрес доставки</div>
                  </q-card-section>

                  <q-card-section class="q-pa-xs">
                    <div class="address-display text-body2">
                      <template v-if="isStructuredAddress(selectedOrder.customer)">
                        <div>{{ selectedOrder.customer.postalCode }}, {{ selectedOrder.customer.city }}</div>
                        <div>ул. {{ selectedOrder.customer.street }}, д. {{ selectedOrder.customer.house }}
                          <template v-if="selectedOrder.customer.apartment">, кв. {{ selectedOrder.customer.apartment
                            }}</template>
                          <template v-if="selectedOrder.customer.entrance">, {{ selectedOrder.customer.entrance
                            }}</template>
                        </div>
                      </template>
                      <template v-else>
                        {{ selectedOrder.customer.address }}
                      </template>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Список товаров -->
              <div class="col-12">
                <q-card flat bordered class="compact-card q-mt-xs">
                  <q-card-section class="q-py-xs row items-center bg-gradient-primary text-white">
                    <q-icon name="inventory_2" size="xs" class="q-mr-xs" />
                    <div class="text-caption">Товары</div>
                  </q-card-section>

                  <q-card-section class="q-pa-xs">
                    <q-table :rows="selectedOrder.items" :columns="itemColumns" row-key="id" flat dense hide-pagination
                      :pagination="{ rowsPerPage: 0 }" class="order-items-table">

                      <template v-slot:body-cell-name="props">
                        <q-td :props="props" class="text-body2">{{ props.value }}</q-td>
                      </template>

                      <template v-slot:body-cell-price="props">
                        <q-td :props="props" class="text-body2">{{ formatPrice(props.value) }} ₽</q-td>
                      </template>

                      <template v-slot:body-cell-quantity="props">
                        <q-td :props="props" class="text-body2 text-center">{{ props.value }}</q-td>
                      </template>

                      <template v-slot:body-cell-total="props">
                        <q-td :props="props" class="text-body2 text-weight-medium">{{ formatPrice(props.value) }}
                          ₽</q-td>
                      </template>
                    </q-table>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Итоги заказа -->
              <div class="col-12">
                <q-card flat bordered class="compact-card q-mt-xs">
                  <q-card-section class="q-pa-xs bg-grey-2">
                    <div class="row justify-end q-gutter-y-xs">
                      <div class="col-12 col-md-5">
                        <div class="row items-center justify-end">
                          <div class="text-caption text-grey-8 q-pr-md">Товары ({{ selectedOrder.totalItems }})</div>
                          <div class="text-body2 text-weight-medium">{{ formatPrice(selectedOrder.subtotal) }} ₽</div>
                        </div>

                        <div class="row items-center justify-end q-mt-xs">
                          <div class="text-caption text-grey-8 q-pr-md">Доставка</div>
                          <div class="text-body2 text-weight-medium">{{ formatPrice(selectedOrder.deliveryCost) }} ₽
                          </div>
                        </div>

                        <q-separator class="q-my-xs" />

                        <div class="row items-center justify-end">
                          <div class="text-subtitle2 text-primary q-pr-md">Итого</div>
                          <div class="text-subtitle1 text-weight-bold text-primary">{{ formatPrice(selectedOrder.total)
                            }} ₽</div>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Диалог изменения статуса -->
    <q-dialog v-model="statusDialog">
      <q-card class="status-dialog-card rounded-card shadow-medium" style="min-width: 350px">
        <q-card-section class="bg-gradient-primary text-white rounded-top">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-sm" />
            Изменить статус заказа
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-select v-model="newStatus" :options="statusOptions" label="Статус" outlined emit-value map-options
            option-label="label" option-value="value" class="status-select">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-chip :color="getStatusColor(scope.opt.value)" text-color="white" dense>
                    <q-icon name="circle" size="xs" />
                  </q-chip>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Отмена" color="grey-7" v-close-popup />
          <q-btn unelevated color="primary" label="Сохранить" @click="updateStatus" :loading="updating"
            class="btn-gradient-primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import {
  getOrders,
  updateOrderStatus,
  db,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "src/boot/firebase";

const $q = useQuasar();

// Состояние данных
const orders = ref([]);
const loading = ref(true);
const error = ref(null);

// Состояние просмотра заказа
const viewDialog = ref(false);
const selectedOrder = ref(null);

// Состояние изменения статуса
const statusDialog = ref(false);
const newStatus = ref(null);
const updating = ref(false);

// Опции статусов
const statusOptions = [
  { label: "Новый", value: "новый" },
  { label: "Подтвержден", value: "подтвержден" },
  { label: "В обработке", value: "в обработке" },
  { label: "Отправлен", value: "отправлен" },
  { label: "Доставлен", value: "доставлен" },
  { label: "Отменен", value: "отменен" },
];

// Колонки для таблицы заказов
const columns = [
  { name: "id", align: "left", label: "№ заказа", field: "id", sortable: true },
  { name: "customer", align: "left", label: "Покупатель", field: "customer" },
  {
    name: "date",
    align: "left",
    label: "Дата",
    field: "createdAt",
    sortable: true,
  },
  {
    name: "items",
    align: "center",
    label: "Товары",
    field: "totalItems",
    sortable: true,
  },
  {
    name: "total",
    align: "right",
    label: "Сумма",
    field: "total",
    sortable: true,
  },
  {
    name: "status",
    align: "center",
    label: "Статус",
    field: "status",
    sortable: true,
  },
  { name: "actions", align: "center", label: "Действия" },
];

// Колонки для таблицы товаров в заказе
const itemColumns = [
  { name: "name", align: "left", label: "Наименование", field: "name" },
  {
    name: "price",
    align: "right",
    label: "Цена",
    field: "price",
    format: (val) => formatPrice(val) + " ₽",
  },
  { name: "quantity", align: "center", label: "Кол-во", field: "quantity" },
  {
    name: "total",
    align: "right",
    label: "Сумма",
    field: "totalPrice",
    format: (val) => formatPrice(val) + " ₽",
  },
];

// Получение заказов из Firestore
const fetchOrders = async () => {
  loading.value = true;
  error.value = null;
  try {
    orders.value = await getOrders();
    // Сортируем по дате (новые сверху)
    orders.value.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
  } catch (err) {
    console.error("Ошибка при загрузке заказов:", err);
    error.value = "Не удалось загрузить данные. Пожалуйста, попробуйте позже.";
  } finally {
    loading.value = false;
  }
};

// Просмотр заказа
const viewOrder = (order) => {
  selectedOrder.value = order;
  viewDialog.value = true;
};

// Изменение статуса заказа
const changeStatus = (order) => {
  selectedOrder.value = order;
  newStatus.value = order.status;
  statusDialog.value = true;
};

// Обновление статуса
const updateStatus = async () => {
  if (!selectedOrder.value || !newStatus.value) return;

  updating.value = true;

  try {
    // Показываем индикатор загрузки, если доступен
    if ($q.loading && typeof $q.loading.show === 'function') {
      $q.loading.show({
        message: "Обновление статуса...",
      });
    } else {
      // Иначе используем уведомление
      $q.notify({
        message: "Обновление статуса...",
        color: "info",
        position: "top",
        timeout: 0
      });
    }

    // Проверяем наличие заказа в Firestore
    const orderRef = doc(db, "orders", selectedOrder.value.id);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      throw new Error("Заказ не найден");
    }

    // Обновляем статус заказа в Firestore
    await updateDoc(orderRef, {
      status: newStatus.value,
      updatedAt: serverTimestamp()
    });

    // Обновляем статус в списке
    const index = orders.value.findIndex(
      (o) => o.id === selectedOrder.value.id
    );
    if (index !== -1) {
      orders.value[index].status = newStatus.value;
      orders.value[index].updatedAt = new Date();
    }

    // Обновляем статус в выбранном заказе
    selectedOrder.value.status = newStatus.value;
    selectedOrder.value.updatedAt = new Date();

    // Уведомляем клиента об изменении статуса
    notifyCustomer(selectedOrder.value, newStatus.value);

    $q.notify({
      color: "positive",
      message: "Статус заказа успешно обновлен",
      icon: "check",
    });

    statusDialog.value = false;
  } catch (err) {
    console.error("Ошибка при обновлении статуса:", err);
    $q.notify({
      color: "negative",
      message: "Не удалось обновить статус заказа: " + (err.message || "неизвестная ошибка"),
      icon: "error",
    });
  } finally {
    // Скрываем загрузку
    if ($q.loading && typeof $q.loading.hide === 'function') {
      $q.loading.hide();
    } else {
      // Закрываем все уведомления
      $q.notify({
        message: "Завершено",
        timeout: 1,
        position: "top"
      });
    }
    updating.value = false;
  }
};

// Форматирование идентификатора заказа
const formatOrderId = (id) => {
  return id ? id.substring(0, 8).toUpperCase() : "";
};

// Форматирование даты
const formatDate = (timestamp) => {
  if (!timestamp) return "Н/Д";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Форматирование цены
const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU").format(price);
};

// Получение цвета для статуса
const getStatusColor = (status) => {
  switch (status) {
    case "новый":
      return "blue";
    case "подтвержден":
      return "teal";
    case "в обработке":
      return "orange";
    case "отправлен":
      return "purple";
    case "доставлен":
      return "positive";
    case "отменен":
      return "negative";
    default:
      return "grey";
  }
};

// Получение названия способа оплаты
const getPaymentMethodLabel = (method) => {
  switch (method) {
    case "card":
      return "Банковской картой онлайн";
    case "cash":
      return "Наличными при получении";
    default:
      return method;
  }
};

// Быстрое подтверждение заказа
const quickConfirmOrder = async (order) => {
  if (!order) return;

  $q.dialog({
    title: "Подтверждение заказа",
    message: `Вы уверены, что хотите подтвердить заказ №${formatOrderId(
      order.id
    )}?`,
    ok: {
      label: "Подтвердить",
      color: "positive",
    },
    cancel: {
      label: "Отмена",
      flat: true,
    },
    persistent: true
  }).onOk(async () => {
    // Локальное состояние загрузки
    const localLoading = ref(true);

    try {
      // Проверяем наличие плагина Loading и используем его, если доступен
      if ($q.loading && typeof $q.loading.show === 'function') {
        $q.loading.show({
          message: "Подтверждение заказа...",
        });
      } else {
        // Иначе показываем уведомление
        $q.notify({
          message: "Подтверждение заказа...",
          color: "info",
          position: "top",
          timeout: 0
        });
      }

      // Проверяем наличие заказа в Firestore
      const orderRef = doc(db, "orders", order.id);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        throw new Error("Заказ не найден");
      }

      // Обновляем статус заказа
      await updateDoc(orderRef, {
        status: "подтвержден",
        updatedAt: serverTimestamp()
      });

      // Обновляем статус в списке
      const index = orders.value.findIndex((o) => o.id === order.id);
      if (index !== -1) {
        orders.value[index].status = "подтвержден";
        orders.value[index].updatedAt = new Date();
      }

      // Уведомление клиента
      notifyCustomer(order, "подтвержден");

      $q.notify({
        color: "positive",
        message: "Заказ успешно подтвержден",
        icon: "check_circle",
      });
    } catch (err) {
      console.error("Ошибка при подтверждении заказа:", err);
      $q.notify({
        color: "negative",
        message: "Не удалось подтвердить заказ: " + (err.message || "неизвестная ошибка"),
        icon: "error",
      });
    } finally {
      // Скрываем загрузку
      if ($q.loading && typeof $q.loading.hide === 'function') {
        $q.loading.hide();
      } else {
        // Закрываем все уведомления
        $q.notify({
          message: "Завершено",
          timeout: 1,
          position: "top"
        });
      }
      localLoading.value = false;
    }
  });
};

// Быстрая отмена заказа
const quickCancelOrder = async (order) => {
  if (!order) return;

  $q.dialog({
    title: "Отмена заказа",
    message: `Вы уверены, что хотите отменить заказ №${formatOrderId(
      order.id
    )}?`,
    prompt: {
      model: "",
      type: "text",
      label: "Причина отмены (необязательно)",
    },
    ok: {
      label: "Отменить заказ",
      color: "negative",
    },
    cancel: {
      label: "Закрыть",
      flat: true,
    },
    persistent: true
  }).onOk(async (reason) => {
    // Локальное состояние загрузки
    const localLoading = ref(true);

    try {
      // Проверяем наличие плагина Loading и используем его, если доступен
      if ($q.loading && typeof $q.loading.show === 'function') {
        $q.loading.show({
          message: "Отмена заказа...",
        });
      } else {
        // Иначе показываем уведомление
        $q.notify({
          message: "Отмена заказа...",
          color: "info",
          position: "top",
          timeout: 0
        });
      }

      // Проверяем наличие заказа в Firestore
      const orderRef = doc(db, "orders", order.id);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        throw new Error("Заказ не найден");
      }

      // Подготавливаем данные для обновления
      const updateData = {
        status: "отменен",
        updatedAt: serverTimestamp()
      };

      // Если указана причина отмены, добавляем ее
      if (reason) {
        updateData.cancelReason = reason;
      }

      // Обновляем статус заказа
      await updateDoc(orderRef, updateData);

      // Обновляем статус в списке
      const index = orders.value.findIndex((o) => o.id === order.id);
      if (index !== -1) {
        orders.value[index].status = "отменен";
        orders.value[index].updatedAt = new Date();
        if (reason) {
          orders.value[index].cancelReason = reason;
        }
      }

      // Уведомление клиента
      notifyCustomer(order, "отменен", reason);

      $q.notify({
        color: "info",
        message: "Заказ отменен",
        icon: "cancel",
      });
    } catch (err) {
      console.error("Ошибка при отмене заказа:", err);
      $q.notify({
        color: "negative",
        message: "Не удалось отменить заказ: " + (err.message || "неизвестная ошибка"),
        icon: "error",
      });
    } finally {
      // Скрываем загрузку
      if ($q.loading && typeof $q.loading.hide === 'function') {
        $q.loading.hide();
      } else {
        // Закрываем все уведомления
        $q.notify({
          message: "Завершено",
          timeout: 1,
          position: "top"
        });
      }
      localLoading.value = false;
    }
  });
};

// Уведомление клиента об изменении статуса заказа
const notifyCustomer = async (order, status, reason) => {
  if (!order || !order.customer || !order.customer.email) return;

  // Здесь можно добавить отправку email, SMS или сообщения в чат
  // Для демонстрации создаем сообщение в чате, если у клиента есть чат
  try {
    // Проверяем, есть ли у пользователя чат
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", order.customer.email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return;

    const userData = querySnapshot.docs[0].data();

    // Найдем чат пользователя
    const chatsRef = collection(db, "chats");
    const chatQuery = query(chatsRef, where("userId", "==", userData.uid));
    const chatSnapshot = await getDocs(chatQuery);

    if (chatSnapshot.empty) return;

    const chatId = chatSnapshot.docs[0].id;

    // Формируем сообщение в зависимости от статуса
    let message = `Статус вашего заказа №${formatOrderId(
      order.id
    )} изменен на "${status}".`;

    if (status === "подтвержден") {
      message +=
        " Ваш заказ принят в обработку и будет доставлен в ближайшее время.";
    } else if (status === "отменен") {
      message += reason
        ? ` Причина: ${reason}`
        : " Приносим извинения за неудобства.";
    }

    // Отправляем сообщение в чат
    const messagesRef = collection(db, "chats", chatId, "messages");
    await addDoc(messagesRef, {
      text: message,
      isUser: false,
      senderId: "system",
      senderEmail: "system@shop.com",
      timestamp: serverTimestamp(),
      readByAdmin: true,
      readByUser: false,
    });

    // Обновляем счетчик непрочитанных сообщений
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      updatedAt: serverTimestamp(),
      lastMessage: message,
      unreadByUser: increment(1),
    });

    console.log(`Уведомление отправлено пользователю ${order.customer.email}`);
  } catch (err) {
    console.error("Ошибка при отправке уведомления клиенту:", err);
  }
};

// Форматирование адреса
const isStructuredAddress = (customer) => {
  return customer && customer.city && customer.street && customer.house;
};

// Загрузка заказов при монтировании компонента
onMounted(fetchOrders);
</script>

<style scoped>
/* Стили для страницы заказов */
.header-section {
  position: relative;
  overflow: hidden;
  padding: 8px 16px;
  border-radius: 8px;
}

.header-section::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 30%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1));
  transform: skewX(-15deg);
}

/* Стили для таблицы заказов */
.orders-table {
  border-radius: 12px;
  overflow: hidden;
}

.order-row {
  transition: background-color 0.2s ease;
}

.order-row:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.action-btn {
  opacity: 0.8;
  transition: all 0.2s ease;
}

.action-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.status-chip {
  font-weight: 500;
  padding: 8px 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Стили для карточки деталей заказа */
.order-detail-card {
  overflow: hidden;
}

.rounded-top {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.order-items-table {
  box-shadow: none;
  border: none;
}

.compact-card {
  border-radius: 8px;
  overflow: hidden;
}

.compact-card .q-table__top,
.compact-card .q-table__bottom,
.compact-card thead tr:first-child th {
  padding: 4px 8px;
}

.compact-card .q-table th {
  font-size: 0.75rem;
  font-weight: 500;
}

.compact-card .q-td {
  padding: 4px 8px;
  font-size: 0.8rem;
}

/* Стили для диалога изменения статуса */
.status-dialog-card {
  overflow: hidden;
}

.status-select {
  width: 100%;
}

/* Адаптивные стили */
@media (max-width: 599px) {
  .header-section {
    padding: 4px 12px;
  }

  .header-section h4 {
    font-size: 1.5rem;
  }
}

/* Стилизация адреса */
.address-display {
  line-height: 1.5;
  white-space: normal;
  padding: 4px 0;
}
</style>
