<!--
  FavoriteButton.vue
  
  Компонент кнопки добавления товара в избранное с анимированными эффектами.
  Используется на карточках товаров для быстрого добавления/удаления из избранного.
  
  Особенности:
  - Анимированные визуальные эффекты при добавлении товара
  - Магические искры для соответствия фэнтезийной тематике
  - Адаптивный дизайн с различными состояниями (активное/неактивное)
  - Всплывающие уведомления о действиях пользователя
-->
<template>
    <q-btn v-if="isFavorite" icon="favorite" color="gradient-heart" round flat size="md" @click.stop="toggleFavorite"
        class="favorite-btn favorite-active">
        <q-tooltip>
            Убрать из избранного
        </q-tooltip>
        <div class="magic-sparkles" v-if="showSparkles"></div>
    </q-btn>
</template>

<script setup>
/**
 * Компонент кнопки избранного с магическими эффектами
 * 
 * Отображает интерактивную кнопку для добавления или удаления товара из списка избранного.
 * При добавлении товара показывает анимированный эффект с магическими искрами,
 * соответствующий фэнтезийной тематике приложения.
 * 
 * @component FavoriteButton
 */
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useFavoritesStore } from 'src/stores/favorites'

/**
 * Принимаемые свойства компонента
 */
const props = defineProps({
    /**
     * Объект товара, для которого отображается кнопка избранного
     * Должен содержать как минимум идентификатор (id)
     */
    product: {
        type: Object,
        required: true
    }
})

const $q = useQuasar()
const favoritesStore = useFavoritesStore()

/**
 * Флаг для контроля отображения анимации магических искр
 * Автоматически сбрасывается через таймаут после активации
 */
const showSparkles = ref(false)

/**
 * Вычисляемое свойство для определения, находится ли товар в избранном
 * Используется для условного отображения активного состояния кнопки
 */
const isFavorite = computed(() => {
    return favoritesStore.isInFavorites(props.product.id)
})

/**
 * Обработчик клика по кнопке избранного
 * Переключает статус товара в избранном и показывает соответствующие анимации и уведомления
 * 
 * @param {Event} event - Событие клика для предотвращения всплытия
 */
const toggleFavorite = (event) => {
    // Предотвращаем всплытие события для избежания перехода на страницу товара
    event.stopPropagation()
    event.preventDefault()

    // Сохраняем текущее состояние перед изменением для определения типа действия
    const wasInFavorites = favoritesStore.isInFavorites(props.product.id)

    // Переключаем статус товара в избранном через хранилище
    favoritesStore.toggleFavorite(props.product)

    // Если добавляем в избранное, показываем анимацию магических искр
    if (!wasInFavorites) {
        showSparkles.value = true
        setTimeout(() => {
            showSparkles.value = false
        }, 1000)
    }

    // Показываем уведомление о выполненном действии
    $q.notify({
        color: !wasInFavorites ? 'positive' : 'negative',
        message: !wasInFavorites ? 'Добавлено в избранное' : 'Убрано из избранного',
        icon: !wasInFavorites ? 'favorite' : 'favorite_border',
        position: 'bottom-right',
        timeout: 1000
    })
}
</script>

<style scoped>
/* Основные стили кнопки избранного */
.favorite-btn {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 10;
    opacity: 1 !important;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    background-color: rgba(255, 255, 255, 0.9);
    padding: 3px;
    border-radius: 50%;
    animation: appear-scale 0.3s ease-in-out;
}

/* Анимация появления кнопки при загрузке */
@keyframes appear-scale {
    0% {
        transform: scale(0);
        opacity: 0;
    }

    70% {
        transform: scale(1.2);
        opacity: 1;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Эффекты при наведении курсора */
.favorite-btn:hover {
    opacity: 1;
    transform: scale(1.1);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
    background-color: rgba(255, 255, 255, 1);
}

/* Анимация для активного состояния (товар в избранном) */
.favorite-active {
    animation: heart-pulse 0.5s ease;
}

/* Пульсация сердечка при активации */
@keyframes heart-pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.3);
    }

    100% {
        transform: scale(1);
    }
}

/* Градиентная заливка для активной кнопки избранного */
:deep(.q-btn--gradient-heart) {
    background: linear-gradient(135deg, #ff5252, #ff1744) !important;
    color: white !important;
    box-shadow: 0 2px 5px rgba(255, 23, 68, 0.3);
    opacity: 1 !important;
}

:deep(.q-btn--gradient-heart:hover) {
    box-shadow: 0 3px 8px rgba(255, 23, 68, 0.5);
}

/* Контейнер для магических эффектов */
.magic-sparkles {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    z-index: -1;
    overflow: hidden;
}

/* Генерация магических искр с использованием псевдоэлементов */
.magic-sparkles::before,
.magic-sparkles::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    animation: magic-sparkle 1s ease-out forwards;
}

/* Золотистые искры для первого слоя эффекта */
.magic-sparkles::before {
    background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 215, 0, 0) 70%);
    animation-delay: 0.1s;
}

/* Розовые искры для второго слоя эффекта */
.magic-sparkles::after {
    background: radial-gradient(circle, rgba(255, 0, 102, 0.6) 0%, rgba(255, 0, 102, 0) 70%);
    animation-delay: 0.2s;
}

/* Анимация расширения и исчезновения искр */
@keyframes magic-sparkle {
    0% {
        transform: scale(0);
        opacity: 1;
    }

    100% {
        transform: scale(3);
        opacity: 0;
    }
}
</style>