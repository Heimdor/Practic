<template>
    <q-page padding>
        <div class="checkout-container">
            <h4 class="text-h4 q-mb-lg">Оформление заказа</h4>

            <!-- Пустая корзина -->
            <div v-if="cartItems.length === 0" class="text-center q-py-xl">
                <q-icon name="shopping_cart_off" size="5rem" color="grey-5" />
                <div class="text-h5 q-mt-md">Ваша корзина пуста</div>
                <div class="text-body1 q-mt-sm text-grey-7">Добавьте товары для оформления заказа</div>
                <q-btn color="primary" label="Вернуться в каталог" to="/" class="q-mt-lg" unelevated />
            </div>

            <!-- Оформление заказа -->
            <div v-else>
                <div class="row q-col-gutter-lg">
                    <!-- Левая колонка: форма заказа -->
                    <div class="col-12 col-md-7">
                        <q-card flat bordered class="q-mb-md">
                            <q-card-section>
                                <div class="text-h6">Данные получателя</div>
                            </q-card-section>

                            <q-separator />

                            <q-card-section>
                                <q-form @submit="submitOrder" ref="orderForm">
                                    <div class="row q-col-gutter-md">
                                        <div class="col-12 col-sm-6">
                                            <q-input v-model="form.firstName" label="Имя *"
                                                :rules="[val => !!val || 'Обязательное поле']" />
                                        </div>
                                        <div class="col-12 col-sm-6">
                                            <q-input v-model="form.lastName" label="Фамилия *"
                                                :rules="[val => !!val || 'Обязательное поле']" />
                                        </div>
                                    </div>

                                    <q-input v-model="form.email" type="email" label="Email *" :rules="[
                                        val => !!val || 'Обязательное поле',
                                        val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Неверный формат email'
                                    ]" />

                                    <q-input v-model="form.phone" type="tel" label="Телефон *"
                                        :rules="[val => !!val || 'Обязательное поле']" mask="+7 (###) ###-##-##" />

                                    <div class="text-subtitle2 q-mb-sm q-mt-md">
                                        <div class="row items-center">
                                            <q-icon name="location_on" size="xs" class="q-mr-xs text-primary" />
                                            <span>Адрес доставки</span>
                                        </div>
                                    </div>
                                    <div class="row q-col-gutter-sm address-section">
                                        <div class="col-12 col-sm-6">
                                            <q-input v-model="form.city" label="Город *" :rules="[
                                                val => !!val || 'Обязательное поле',
                                                val => val.length >= 2 || 'Минимум 2 символа'
                                            ]" clearable class="address-input" filled dense>
                                                <template v-slot:prepend>
                                                    <q-icon name="location_city" size="xs" color="primary" />
                                                </template>
                                            </q-input>
                                        </div>
                                        <div class="col-12 col-sm-6">
                                            <q-input v-model="form.postalCode" label="Почтовый индекс *" :rules="[
                                                val => !!val || 'Обязательное поле',
                                                val => /^\d{6}$/.test(val) || 'Индекс должен содержать 6 цифр'
                                            ]" mask="######" class="address-input" filled dense>
                                                <template v-slot:prepend>
                                                    <q-icon name="markunread_mailbox" size="xs" color="primary" />
                                                </template>
                                                <template v-slot:hint>
                                                    Формат: 123456
                                                </template>
                                            </q-input>
                                        </div>
                                        <div class="col-12">
                                            <q-input v-model="form.street" label="Улица *" :rules="[
                                                val => !!val || 'Обязательное поле',
                                                val => val.length >= 3 || 'Минимум 3 символа'
                                            ]" clearable class="address-input" filled dense>
                                                <template v-slot:prepend>
                                                    <q-icon name="signpost" size="xs" color="primary" />
                                                </template>
                                            </q-input>
                                        </div>
                                        <div class="col-12 col-sm-4">
                                            <q-input v-model="form.house" label="Дом *"
                                                :rules="[val => !!val || 'Обязательное поле']" clearable
                                                class="address-input" filled dense>
                                                <template v-slot:prepend>
                                                    <q-icon name="home" size="xs" color="primary" />
                                                </template>
                                            </q-input>
                                        </div>
                                        <div class="col-12 col-sm-4">
                                            <q-input v-model="form.apartment" label="Квартира/офис" clearable
                                                class="address-input" filled dense>
                                                <template v-slot:prepend>
                                                    <q-icon name="apartment" size="xs" color="primary" />
                                                </template>
                                            </q-input>
                                        </div>
                                        <div class="col-12 col-sm-4">
                                            <q-input v-model="form.entrance" label="Подъезд/этаж" clearable
                                                class="address-input" filled dense>
                                                <template v-slot:prepend>
                                                    <q-icon name="stairs" size="xs" color="primary" />
                                                </template>
                                            </q-input>
                                        </div>
                                        <div class="col-12 q-mt-xs">
                                            <div class="address-preview q-pa-sm">
                                                <div class="text-caption text-grey">Адрес доставки:</div>
                                                <div class="text-body2">{{ formatFullAddress() || 'Заполните адрес доставки' }}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <q-separator class="q-my-lg" />

                                    <div class="text-h6 q-mb-md">Способ оплаты</div>
                                    <q-option-group v-model="form.paymentMethod" :options="paymentOptions"
                                        type="radio" />

                                    <q-separator class="q-my-lg" />

                                    <div class="text-h6 q-mb-md">Комментарий к заказу</div>
                                    <q-input v-model="form.comment" type="textarea" label="Комментарий" />
                                </q-form>
                            </q-card-section>
                        </q-card>
                    </div>

                    <!-- Правая колонка: товары в корзине и итоги -->
                    <div class="col-12 col-md-5">
                        <q-card flat bordered>
                            <q-card-section>
                                <div class="text-h6">Ваш заказ</div>
                            </q-card-section>

                            <q-separator />

                            <q-card-section class="q-pa-none">
                                <q-list separator>
                                    <q-item v-for="item in cartItems" :key="item.id" class="q-py-md">
                                        <q-item-section avatar>
                                            <q-img :src="item.image" style="width: 50px; height: 50px"
                                                class="rounded-borders" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label>{{ item.name }}</q-item-label>
                                            <q-item-label caption>{{ formatPrice(item.price) }} ₽ × {{ item.quantity
                                            }}</q-item-label>
                                        </q-item-section>
                                        <q-item-section side>
                                            <q-item-label class="text-weight-bold">{{ formatPrice(item.price *
                                                item.quantity) }} ₽</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-card-section>

                            <q-separator />

                            <q-card-section>
                                <div class="row items-center q-mb-sm">
                                    <div class="col text-body1">Товары ({{ cartItemsCount }})</div>
                                    <div class="col-auto text-body1 text-weight-medium">{{ formatPrice(cartTotalPrice)
                                    }} ₽</div>
                                </div>
                                <div class="row items-center q-mb-sm">
                                    <div class="col text-body1">Доставка</div>
                                    <div class="col-auto text-body1 text-weight-medium">{{ formatPrice(deliveryCost) }}
                                        ₽</div>
                                </div>
                                <q-separator class="q-my-md" />
                                <div class="row items-center text-primary">
                                    <div class="col text-h6">Итого</div>
                                    <div class="col-auto text-h5 text-weight-bold">{{ formatPrice(totalWithDelivery) }}
                                        ₽</div>
                                </div>

                                <q-btn color="primary" class="full-width q-mt-lg" size="lg" label="Оформить заказ"
                                    @click="submitOrder" :loading="submitting" unelevated />
                            </q-card-section>
                        </q-card>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно успешного оформления заказа -->
        <q-dialog v-model="successDialog" persistent>
            <q-card style="min-width: 350px">
                <q-card-section class="bg-positive text-white">
                    <div class="text-h6">Заказ успешно оформлен</div>
                </q-card-section>

                <q-card-section class="q-pt-lg">
                    <p>Ваш заказ успешно оформлен и передан в обработку!</p>
                    <p>Номер заказа: <strong>{{ orderNumber }}</strong></p>
                    <p>В ближайшее время с вами свяжется наш менеджер для подтверждения заказа.</p>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat color="primary" label="В каталог" to="/" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { createOrder } from 'src/boot/firebase';

const $q = useQuasar();
const router = useRouter();

// Получаем данные корзины через инъекцию
const cartItems = inject('cartItems');
const cartItemsCount = inject('cartItemsCount');
const cartTotalPrice = inject('cartTotalPrice');
const clearCart = inject('clearCart');

// Состояние формы
const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    postalCode: '',
    street: '',
    house: '',
    apartment: '',
    entrance: '',
    paymentMethod: 'card',
    comment: ''
});

// Стоимость доставки
const deliveryCost = computed(() => {
    // Бесплатная доставка при сумме заказа более 5000 рублей
    return cartTotalPrice.value > 5000 ? 0 : 500;
});

// Общая сумма с доставкой
const totalWithDelivery = computed(() => {
    return cartTotalPrice.value + deliveryCost.value;
});

// Опции для способа оплаты
const paymentOptions = [
    {
        label: 'Банковской картой онлайн',
        value: 'card'
    },
    {
        label: 'Наличными при получении',
        value: 'cash'
    }
];

// Состояние оформления заказа
const submitting = ref(false);
const orderForm = ref(null);
const successDialog = ref(false);
const orderNumber = ref('');

// Форматирование цены
const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
};

// Отправка заказа
const submitOrder = async () => {
    // Проверяем валидность формы
    const isValid = await orderForm.value.validate();
    if (!isValid) {
        return;
    }

    submitting.value = true;

    try {
        // Собираем данные заказа
        const orderData = {
            customer: {
                firstName: form.value.firstName,
                lastName: form.value.lastName,
                email: form.value.email,
                phone: form.value.phone,
                // Структурированный адрес
                city: form.value.city,
                postalCode: form.value.postalCode,
                street: form.value.street,
                house: form.value.house,
                apartment: form.value.apartment,
                entrance: form.value.entrance,
                // Полный адрес в одной строке для обратной совместимости
                address: formatFullAddress()
            },
            items: cartItems.value.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                totalPrice: item.price * item.quantity
            })),
            totalItems: cartItemsCount.value,
            subtotal: cartTotalPrice.value,
            deliveryCost: deliveryCost.value,
            total: totalWithDelivery.value,
            paymentMethod: form.value.paymentMethod,
            comment: form.value.comment
        };

        // Сохраняем заказ в Firebase
        const result = await createOrder(orderData);

        // Генерируем номер заказа
        orderNumber.value = result.id.substring(0, 8).toUpperCase();

        // Очищаем корзину
        clearCart();

        // Показываем уведомление об успешном оформлении
        successDialog.value = true;

    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
        $q.notify({
            color: 'negative',
            message: 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте снова.',
            icon: 'error'
        });
    } finally {
        submitting.value = false;
    }
};

// Метод для форматирования полного адреса
const formatFullAddress = () => {
    return [
        form.value.city,
        form.value.postalCode,
        form.value.street,
        form.value.house,
        form.value.apartment,
        form.value.entrance
    ].filter(Boolean).join(', ');
};
</script>

<style scoped>
.checkout-container {
    max-width: 1200px;
    margin: 0 auto;
}

.q-form .q-input,
.q-form .q-select {
    margin-bottom: 16px;
}

.form-card {
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.form-card:hover {
    box-shadow: var(--magic-glow);
}

.payment-options {
    margin-top: 5px;
}

/* Стилизация адреса доставки */
.address-section {
    background-color: rgba(70, 43, 130, 0.05);
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
}

.address-input {
    margin-bottom: 8px !important;
}

.address-input :deep(.q-field__control) {
    padding: 0 8px;
}

.address-preview {
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 6px;
    border: 1px dashed rgba(70, 43, 130, 0.3);
}

.text-subtitle2 {
    color: #462b82;
    font-weight: 500;
}
</style>