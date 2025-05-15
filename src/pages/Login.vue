<template>
  <q-page class="login-page flex flex-center">
    <div class="login-container">
      <q-card class="auth-card q-px-md q-py-lg">
        <q-card-section class="text-center">
          <div class="text-h5 q-mb-md fantasy-title">{{ isLogin ? 'Вход в аккаунт' : 'Регистрация' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="submitForm" ref="authForm">
            <q-input v-model="form.email" label="Email" type="email" :rules="[
              val => !!val || 'Email обязателен',
              val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Введите корректный email'
            ]">
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input v-model="form.password" label="Пароль" :type="showPassword ? 'text' : 'password'" :rules="[
              val => !!val || 'Пароль обязателен',
              val => val.length >= 6 || 'Пароль должен содержать минимум 6 символов'
            ]">
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                  @click="showPassword = !showPassword" />
              </template>
            </q-input>

            <!-- Поля только для регистрации -->
            <template v-if="!isLogin">
              <q-input v-model="form.confirmPassword" label="Подтвердите пароль"
                :type="showConfirmPassword ? 'text' : 'password'" :rules="[
                  val => !!val || 'Подтверждение пароля обязательно',
                  val => val === form.password || 'Пароли не совпадают'
                ]">
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon :name="showConfirmPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                    @click="showConfirmPassword = !showConfirmPassword" />
                </template>
              </q-input>
            </template>

            <div class="full-width q-mt-md">
              <q-btn type="submit" color="primary" class="full-width login-btn"
                :label="isLogin ? 'Войти' : 'Зарегистрироваться'" :loading="loading" unelevated />
            </div>
          </q-form>

          <div class="text-center q-mt-md">
            <q-btn flat color="primary" :label="isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт? Войдите'"
              @click="isLogin = !isLogin" />
          </div>
        </q-card-section>

        <!-- Сообщение об ошибке -->
        <q-card-section v-if="error" class="text-negative text-center">
          {{ error }}
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const isLogin = ref(true);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const error = ref('');
const authForm = ref(null);

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
});

const submitForm = async () => {
  try {
    // Проверяем валидность формы
    const isValid = await authForm.value.validate();
    if (!isValid) return;

    loading.value = true;
    error.value = '';

    if (isLogin.value) {
      // Вход в систему
      await authStore.login(form.email, form.password);
      $q.notify({
        color: 'positive',
        message: 'Вход выполнен успешно',
        icon: 'check'
      });
      router.push('/profile');
    } else {
      // Регистрация
      await authStore.register(form.email, form.password);
      $q.notify({
        color: 'positive',
        message: 'Регистрация выполнена успешно',
        icon: 'check'
      });
      router.push('/profile');
    }
  } catch (err) {
    console.error('Ошибка аутентификации:', err);

    // Обработка стандартных ошибок Firebase
    switch (err.code) {
      case 'auth/user-not-found':
        error.value = 'Пользователь с таким email не найден';
        break;
      case 'auth/wrong-password':
        error.value = 'Неверный пароль';
        break;
      case 'auth/email-already-in-use':
        error.value = 'Этот email уже используется';
        break;
      case 'auth/weak-password':
        error.value = 'Пароль слишком простой';
        break;
      case 'auth/invalid-email':
        error.value = 'Некорректный email';
        break;
      case 'auth/configuration-not-found':
        error.value = 'Ошибка конфигурации Firebase. Обратитесь к администратору.';
        break;
      case 'auth/operation-not-allowed':
        error.value = 'Этот метод входа не разрешен. Обратитесь к администратору.';
        break;
      case 'auth/network-request-failed':
        error.value = 'Ошибка сети. Проверьте подключение к интернету.';
        break;
      case 'auth/internal-error':
        error.value = 'Внутренняя ошибка Firebase. Попробуйте позже.';
        break;
      default:
        error.value = `Произошла ошибка при авторизации: ${err.message}`;
    }

    $q.notify({
      color: 'negative',
      message: error.value,
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-image: url('/images/landing.jpg');
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay;
  position: relative;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(26, 16, 60, 0.8);
  z-index: 0;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  padding: 20px;
}

.auth-card {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
}

.q-input {
  margin-bottom: 20px;
}

.fantasy-title {
  font-family: 'Cinzel', serif;
  letter-spacing: 1px;
  color: #2c1d54;
}

.login-btn {
  border-radius: 28px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(44, 29, 84, 0.35);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(44, 29, 84, 0.4);
}
</style>
