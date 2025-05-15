<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-center q-mb-md">Редактирование профиля</div>

    <!-- Форма редактирования профиля -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Измените данные профиля</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit.prevent="saveProfile">
          <q-input
            v-model="form.name"
            label="Имя"
            outlined
            class="q-mb-md"
            required
          />
          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            outlined
            class="q-mb-md"
            required
          />
          <q-input
            v-model="form.phone"
            label="Телефон"
            type="tel"
            outlined
            class="q-mb-md"
            required
          />
          <q-btn
            type="submit"
            label="Сохранить"
            color="primary"
            class="full-width"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

// Получаем данные пользователя из localStorage или задаём начальные значения
const user = ref(JSON.parse(localStorage.getItem("user")) || {
  name: "Олег Тестовый",
  email: "oleg.testoviy@example.com",
  phone: "+7 123 456 78 90",
});

// Локальная копия данных для редактирования
const form = ref({ ...user.value });

// Используем роутер для навигации
const router = useRouter();

// Функция сохранения профиля
const saveProfile = () => {
  // Сохраняем изменения в localStorage
  localStorage.setItem("user", JSON.stringify(form.value));
  console.log("Профиль сохранён:", form.value);

  // Возврат на страницу профиля
  router.push("/Profile");
};
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
