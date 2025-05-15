<template>
  <router-view />
</template>

<script setup>
import { ref, provide, computed } from 'vue'

// Состояние корзины
const cartItems = ref([])

// Подсчет количества товаров в корзине
const cartItemsCount = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})

// Подсчет общей стоимости товаров в корзине
const cartTotalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

// Добавление товара в корзину
const addToCart = (product) => {
  const existingItem = cartItems.value.find(item => item.id === product.id)

  if (existingItem) {
    // Если товар уже есть в корзине, увеличиваем количество
    existingItem.quantity++
  } else {
    // Если товара нет в корзине, добавляем с количеством 1
    cartItems.value.push({
      ...product,
      quantity: 1,
      addedAt: new Date()
    })
  }

  // Сохраняем корзину в localStorage
  saveCartToLocalStorage()
}

// Удаление товара из корзины
const removeFromCart = (productId) => {
  const index = cartItems.value.findIndex(item => item.id === productId)

  if (index !== -1) {
    cartItems.value.splice(index, 1)
    // Сохраняем корзину в localStorage
    saveCartToLocalStorage()
  }
}

// Изменение количества товара в корзине
const updateCartItemQuantity = (productId, quantity) => {
  const item = cartItems.value.find(item => item.id === productId)

  if (item) {
    if (quantity > 0) {
      item.quantity = quantity
    } else {
      // Если количество 0 или отрицательное, удаляем товар
      removeFromCart(productId)
    }
    // Сохраняем корзину в localStorage
    saveCartToLocalStorage()
  }
}

// Очистка корзины
const clearCart = () => {
  cartItems.value = []
  // Сохраняем корзину в localStorage
  saveCartToLocalStorage()
}

// Сохранение корзины в localStorage
const saveCartToLocalStorage = () => {
  localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
}

// Загрузка корзины из localStorage при загрузке страницы
const loadCartFromLocalStorage = () => {
  const savedCart = localStorage.getItem('cartItems')
  if (savedCart) {
    try {
      cartItems.value = JSON.parse(savedCart)
    } catch (e) {
      console.error('Ошибка при загрузке корзины из localStorage:', e)
      cartItems.value = []
    }
  }
}

// Загружаем корзину при инициализации
loadCartFromLocalStorage()

// Предоставляем доступ к корзине всем компонентам
provide('cartItems', cartItems)
provide('cartItemsCount', cartItemsCount)
provide('cartTotalPrice', cartTotalPrice)
provide('addToCart', addToCart)
provide('removeFromCart', removeFromCart)
provide('updateCartItemQuantity', updateCartItemQuantity)
provide('clearCart', clearCart)
</script>
