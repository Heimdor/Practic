<template>
    <q-page class="landing-page">
        <div class="header-section">
            <div class="container">
                <div class="row justify-center items-center">
                    <div class="col-12 col-md-6 text-center text-md-left">
                        <h1 class="text-h2 text-weight-bold text-primary fantasy-title">Добро пожаловать<br>в Fantasy
                            Shop</h1>
                        <p class="text-subtitle1 q-mt-md">Ваш магазин фэнтези товаров с магическими артефактами и
                            оружием для настоящих героев.</p>
                        <h3 class="text-h5 q-mt-lg fantasy-slogan">С нами вы всегда будете готовы!</h3>
                        <div class="q-mt-xl">
                            <q-btn v-if="!authStore.isAuthenticated" to="/login" color="primary" label="Войти"
                                class="login-btn q-py-sm q-px-lg" size="large" no-caps unelevated />
                            <template v-else>
                                <q-btn to="/catalog" color="primary" label="Перейти в каталог"
                                    class="login-btn q-py-sm q-px-lg" size="large" no-caps unelevated />
                                <q-btn to="/profile" color="secondary" flat label="Мой профиль"
                                class="q-ml-md q-py-sm q-px-lg" size="large" no-caps />
                            </template>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 q-mt-lg q-mt-md-none text-center">
                        <img src="/images/landing.jpg" class="landing-image" alt="Fantasy landscape">
                    </div>
                </div>
            </div>
        </div>

        <div class="container q-py-xl">
            <FantasyCategoriesShowcase />
        </div>

        <div class="features-section q-py-xl">
            <div class="container">
                <h2 class="text-h4 text-center text-weight-bold q-mb-xl fantasy-title">Наши преимущества</h2>
                <div class="row q-col-gutter-xl">
                    <div class="col-12 col-md-4">
                        <div class="feature-card q-pa-md text-center">
                            <q-icon name="auto_awesome" size="4rem" color="primary" />
                            <h3 class="text-h6 q-mt-md">Магические предметы</h3>
                            <p class="q-mt-sm">Настоящие артефакты с древними заклинаниями для ваших приключений.</p>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="feature-card q-pa-md text-center">
                            <q-icon name="shield" size="4rem" color="primary" />
                            <h3 class="text-h6 q-mt-md">Защитное снаряжение</h3>
                            <p class="q-mt-sm">Доспехи и щиты, которые защитят вас в самых опасных подземельях.</p>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="feature-card q-pa-md text-center">
                            <q-icon name="psychology_alt" size="4rem" color="primary" />
                            <h3 class="text-h6 q-mt-md">Консультация мудрецов</h3>
                            <p class="q-mt-sm">Наши опытные волшебники подскажут, какие артефакты подойдут именно вам.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="cta-section q-py-xl bg-primary text-white">
            <div class="container text-center">
                <h2 class="text-h4 text-weight-bold fantasy-title">Готовы начать приключение?</h2>
                <p class="text-subtitle1 q-mt-md">
                    <span v-if="!authStore.isAuthenticated">Зарегистрируйтесь или войдите в свой аккаунт, чтобы получить
                        доступ к нашему каталогу магических товаров.</span>
                    <span v-else>Переходите в каталог и выбирайте артефакты для своего следующего квеста!</span>
                </p>
                <q-btn v-if="!authStore.isAuthenticated" to="/login" color="white" text-color="primary"
                    label="Войти в аккаунт" class="q-mt-lg q-py-sm q-px-xl" size="large" no-caps />
                <q-btn v-else to="/catalog" color="white" text-color="primary" label="В каталог"
                    class="q-mt-lg q-py-sm q-px-xl" size="large" no-caps />
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { defineComponent } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import FantasyCategoriesShowcase from 'src/components/FantasyCategoriesShowcase.vue'

const authStore = useAuthStore()

defineComponent({
    name: 'LandingPage'
})
</script>

<style scoped>
.landing-page {
    overflow: hidden;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.header-section {
    padding: 120px 0;
    background: linear-gradient(135deg, #1a103c 0%, #2c1d54 100%);
    background-image: url('/images/landing.jpg');
    background-size: cover;
    background-position: center;
    background-blend-mode: overlay;
    border-bottom-right-radius: 30% 10%;
    border-bottom-left-radius: 30% 10%;
    color: white;
    position: relative;
}

.header-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(26, 16, 60, 0.8);
    z-index: 0;
}

.header-section .container {
    position: relative;
    z-index: 1;
}

.landing-image {
    max-width: 100%;
    max-height: 450px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.login-btn {
    border-radius: 28px;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 10px rgba(var(--q-primary-rgb), 0.35);
    transition: all 0.3s ease;
}

.login-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(var(--q-primary-rgb), 0.4);
}

.feature-card {
    height: 100%;
    background: linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 1px solid rgba(var(--q-primary-rgb), 0.1);
}

.feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(var(--q-primary-rgb), 0.2);
}

.cta-section {
    background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
    position: relative;
}

.cta-section:before,
.cta-section:after {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
}

.cta-section:before {
    top: -100px;
    left: -100px;
}

.cta-section:after {
    bottom: -100px;
    right: -100px;
}

.fantasy-title {
    font-family: 'Cinzel', serif;
    letter-spacing: 1px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.fantasy-slogan {
    font-family: 'Cinzel', serif;
    font-style: italic;
    color: #e9c46a;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

@media (max-width: 599px) {
    .header-section {
        padding: 60px 0;
    }

    h1.text-h2 {
        font-size: 2.2rem !important;
    }

    .landing-image {
        max-width: 85%;
        margin-top: 40px;
    }
}
</style>