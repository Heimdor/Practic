<!-- 
  EssentialLink.vue
  Компонент для элементов навигационного меню.
  
  Используется в макете MainLayout для отображения ссылок в боковом меню.
-->
<template>
  <q-item clickable tag="a" :to="props.link" class="essential-link" v-ripple>
    <q-item-section v-if="props.icon" avatar>
      <q-icon :name="props.icon" class="menu-icon">
        <q-badge v-if="props.badge" color="accent" floating>
          {{ props.badge }}
        </q-badge>
      </q-icon>
    </q-item-section>

    <q-item-section>
      <q-item-label class="menu-title">{{ props.title }}</q-item-label>
      <q-item-label caption class="menu-caption">{{ props.caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
/**
 * Компонент навигационной ссылки
 * 
 * @component EssentialLink
 */

/**
 * Свойства компонента
 */
const props = defineProps({
  /**
   * Заголовок ссылки
   */
  title: {
    type: String,
    required: true
  },

  /**
   * Подпись под заголовком
   */
  caption: {
    type: String,
    default: ''
  },

  /**
   * URL для перехода
   */
  link: {
    type: String,
    default: '#'
  },

  /**
   * Иконка из набора Material Icons
   */
  icon: {
    type: String,
    default: ''
  },

  /**
   * Значок с количеством (например, непрочитанных сообщений)
   */
  badge: {
    type: [Number, String],
    default: null
  }
})
</script>

<style scoped>
.essential-link {
  transition: background-color 0.3s ease;
  border-radius: 8px;
  margin: 0 8px 4px 8px;
}

.essential-link:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.menu-icon {
  transition: transform 0.3s ease;
}

.essential-link:hover .menu-icon {
  transform: translateX(3px);
}

.menu-title {
  font-weight: 500;
}

.menu-caption {
  opacity: 0.7;
}
</style>
