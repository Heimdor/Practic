<template>
    <q-card class="product-card flex column">
        <q-img :src="product.image" :ratio="1" class="product-image" spinner-color="primary" spinner-size="82px">
            <div class="absolute-top-right q-pa-xs">
                <div class="category-badge">
                    {{ product.category }}
                </div>
            </div>

            <FavoriteButton :product="product" />
        </q-img>

        <q-card-section class="product-content">
            <div class="text-subtitle1 ellipsis-2-lines product-name">{{ product.name }}</div>
            <div class="text-h6 text-primary q-mt-sm price-tag">{{ formatPrice(product.price) }} ₽</div>
            <div class="text-body2 ellipsis-3-lines q-mt-xs">{{ product.description }}</div>
        </q-card-section>

        <div class="button-container q-mt-auto">
            <!-- Если товар еще не в корзине -->
            <div v-if="!itemInCart" class="row justify-center q-gutter-sm">
                <q-btn unelevated color="primary" icon="shopping_cart" :label="$q.screen.lt.sm ? null : 'В корзину'"
                    @click="handleAddToCart" class="cart-btn" />
                <q-btn unelevated :color="isFavorite ? 'gradient-heart' : 'red-5'"
                    :icon="isFavorite ? 'favorite' : 'favorite_border'" :label="$q.screen.lt.sm ? null : 'В избранное'"
                    @click.stop="toggleFavorite" class="cart-btn heart-btn"
                    :class="{ 'favorite-active': isFavorite }" />
            </div>

            <!-- Если товар уже в корзине -->
            <div v-else class="row justify-between items-center">
                <div class="quantity-controls">
                    <q-btn unelevated round color="primary" icon="remove" @click="decreaseQuantity"
                        class="control-btn" />
                    <div class="text-center text-weight-medium quantity-display">{{ cartItem.quantity }}</div>
                    <q-btn unelevated round color="primary" icon="add" @click="increaseQuantity" class="control-btn" />
                </div>
            </div>
        </div>
    </q-card>
</template>

<script setup>
import { defineProps, inject, computed } from 'vue'
import { useQuasar } from 'quasar'
import FavoriteButton from './FavoriteButton.vue'
import { useFavoritesStore } from 'src/stores/favorites'

const $q = useQuasar()
const favoritesStore = useFavoritesStore()

const props = defineProps({
    product: {
        type: Object,
        required: true
    }
})

// Получаем функциональность корзины
const cartItems = inject('cartItems')
const addToCart = inject('addToCart')
const updateCartItemQuantity = inject('updateCartItemQuantity')

// Проверяем, есть ли товар в корзине
const cartItem = computed(() => {
    return cartItems.value.find(item => item.id === props.product.id)
})

// Флаг, показывающий, есть ли товар в корзине
const itemInCart = computed(() => {
    return !!cartItem.value
})

// Проверка, находится ли товар в избранном
const isFavorite = computed(() => {
    return favoritesStore.isInFavorites(props.product.id)
})

// Обработчик добавления товара в корзину
const handleAddToCart = () => {
    addToCart(props.product)
}

// Увеличение количества товара
const increaseQuantity = () => {
    if (cartItem.value) {
        updateCartItemQuantity(props.product.id, cartItem.value.quantity + 1)
    }
}

// Уменьшение количества товара
const decreaseQuantity = () => {
    if (cartItem.value && cartItem.value.quantity > 1) {
        updateCartItemQuantity(props.product.id, cartItem.value.quantity - 1)
    } else {
        // Если количество = 1, удаляем товар из корзины
        updateCartItemQuantity(props.product.id, 0)
    }
}

// Переключение статуса избранного
const toggleFavorite = (event) => {
    if (event) {
        event.stopPropagation()
        event.preventDefault()
    }

    // Сохраняем текущее состояние перед изменением
    const wasInFavorites = favoritesStore.isInFavorites(props.product.id)

    favoritesStore.toggleFavorite(props.product)

    // Добавляем класс для анимации
    const heartBtn = event?.target?.closest('.heart-btn')
    if (heartBtn) {
        heartBtn.classList.add('q-btn--active')
        setTimeout(() => {
            heartBtn.classList.remove('q-btn--active')
        }, 500)
    }

    $q.notify({
        color: !wasInFavorites ? 'positive' : 'negative',
        message: !wasInFavorites ? 'Добавлено в избранное' : 'Убрано из избранного',
        icon: !wasInFavorites ? 'favorite' : 'favorite_border',
        position: 'bottom-right',
        timeout: 1000
    })
}

const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price)
}
</script>

<style scoped>
.product-card {
    width: 100%;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    min-height: 350px;
    height: 100%;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    background-color: #ffffff;
}

/* Fantasy theme enhancements */
.product-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0));
    z-index: 1;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--magic-glow);
}

.product-card:hover::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    padding: 2px;
    background: var(--magical-border);
    -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 2;
}

.product-image {
    height: auto;
    object-fit: cover;
}

.product-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 16px;
    color: #333333;
}

.button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 16px 16px;
}

.category-badge {
    font-size: 0.85rem;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 4px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
    background: linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2));
    backdrop-filter: blur(2px);
    color: white;
}

.product-name {
    font-weight: 500;
    line-height: 1.3;
    color: #333333;
}

.price-tag {
    font-weight: 700;
    font-size: 1.3rem;
    color: #1976d2;
    position: relative;
    display: inline-block;
}

/* Magic sparkle effect on price hover */
.price-tag:hover::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--magic-accent);
    opacity: 0.1;
    filter: blur(4px);
    animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
    0% {
        transform: scale(1);
        opacity: 0.1;
    }

    50% {
        transform: scale(1.1);
        opacity: 0.2;
    }

    100% {
        transform: scale(1);
        opacity: 0.1;
    }
}

.cart-btn {
    min-height: 32px;
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0.3px;
    transition: all 0.2s ease;
    border-radius: 4px;
    width: 90%;
}

.cart-btn:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: var(--magic-glow);
}

.quantity-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 90%;
}

.control-btn {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
}

.quantity-display {
    font-size: 1.1rem;
    font-weight: 700;
    min-width: 40px;
    text-align: center;
}

.favorite-btn-cart {
    transition: all 0.2s ease;
}

.favorite-btn-cart:hover {
    transform: scale(1.1);
}

.ellipsis-2-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.ellipsis-3-lines {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: #666666;
}

@media (max-width: 599px) {
    .product-card {
        min-height: 260px;
    }

    .product-content {
        padding: 10px;
    }

    .button-container {
        padding: 0 10px 10px;
    }

    .product-name {
        font-size: 0.85rem;
    }

    .price-tag {
        font-size: 1.1rem;
        margin-top: 4px;
    }

    .text-body2 {
        font-size: 0.75rem;
    }

    .ellipsis-3-lines {
        -webkit-line-clamp: 2;
    }

    .cart-btn {
        min-height: 32px;
    }

    .control-btn {
        width: 32px;
        height: 32px;
    }

    .quantity-display {
        font-size: 0.9rem;
    }

    .category-badge {
        font-size: 0.7rem;
        padding: 3px 6px;
    }
}

@keyframes pulse-heart {
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

.heart-btn {
    opacity: 1 !important;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.heart-btn.favorite-active {
    background: linear-gradient(135deg, #ff5252, #ff1744) !important;
    color: white !important;
    box-shadow: 0 2px 5px rgba(255, 23, 68, 0.3);
    transform: translateY(-2px);
}

.heart-btn.favorite-active:hover {
    box-shadow: 0 3px 8px rgba(255, 23, 68, 0.5);
}

.heart-btn.q-btn--active {
    animation: heart-pulse 0.5s ease;
}

@keyframes heart-pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}

/* Градиент для кнопки избранного */
.q-btn--gradient-heart {
    background: linear-gradient(135deg, #ff5252, #ff1744) !important;
    color: white !important;
    box-shadow: 0 2px 5px rgba(255, 23, 68, 0.3);
}

.q-btn--gradient-heart:hover {
    box-shadow: 0 3px 8px rgba(255, 23, 68, 0.5);
}
</style>