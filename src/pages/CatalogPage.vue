<template>
    <q-page class="q-pa-md">
        <div class="row q-mb-md justify-between items-center">
            <h1 class="text-h5 q-my-none text-primary">Каталог товаров</h1>
            <q-btn v-if="!authStore.isAuthenticated" to="/login" color="primary" label="Войти" no-caps
                class="q-px-md" />
        </div>

        <div class="filters-container q-mb-lg">
            <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-4">
                    <q-input filled v-model="search" label="Поиск товара..." debounce="300" clearable dense>
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </div>

                <div class="col-12 col-md-4">
                    <q-select filled v-model="category" :options="categories" label="Категория" clearable emit-value
                        map-options option-label="label" option-value="value" dense>
                        <template v-slot:prepend>
                            <q-icon name="category" />
                        </template>
                    </q-select>
                </div>

                <div class="col-12 col-md-4">
                    <q-select filled v-model="sort" :options="sortOptions" label="Сортировка" emit-value map-options
                        option-label="label" option-value="value" dense>
                        <template v-slot:prepend>
                            <q-icon name="sort" />
                        </template>
                    </q-select>
                </div>
            </div>
        </div>

        <!-- Состояние загрузки -->
        <div v-if="loading" class="text-center q-py-xl">
            <q-spinner-dots color="primary" size="50px" />
            <div class="text-subtitle1 q-mt-md">Загрузка товаров...</div>
        </div>

        <!-- Состояние ошибки -->
        <div v-else-if="error" class="text-center q-py-xl">
            <q-icon name="error" color="negative" size="50px" />
            <div class="text-subtitle1 q-mt-md">{{ error }}</div>
            <q-btn color="primary" label="Повторить" class="q-mt-md" @click="fetchProducts" />
        </div>

        <!-- Товары найдены -->
        <div v-else-if="filteredProducts.length > 0" class="products-grid">
            <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product"
                @add-to-cart="addToCart" />
        </div>

        <!-- Товары не найдены -->
        <div v-else class="text-center q-py-xl">
            <q-icon name="search_off" size="50px" color="grey-7" />
            <div class="text-h6 q-mt-md">Товары не найдены</div>
            <div class="text-subtitle2 text-grey-7 q-mb-md">Попробуйте изменить параметры поиска</div>

            <div v-if="products.length === 0" class="q-mt-lg">
                <div class="text-subtitle1 q-mb-md">Каталог товаров пуст</div>
                <q-btn color="accent" icon="magic" label="Добавить фэнтези товары" :loading="initializing"
                    @click="initializeFantasyProducts" />
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { QInput, QSelect, QPage } from 'quasar'
import ProductCard from '../components/ProductCard.vue'
import { ref, computed, inject, onMounted } from 'vue'
import { getProducts } from 'src/boot/firebase';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';
import { addFantasyProducts } from 'src/data/fantasy-products';

const $q = useQuasar();
const authStore = useAuthStore();
const search = ref('')
const category = ref(null)
const sort = ref(null)
const products = ref([])
const loading = ref(true)
const error = ref(null)
const initializing = ref(false)

const sortOptions = [
    { label: 'По умолчанию', value: 'default' },
    { label: 'По цене (возрастание)', value: 'price-asc' },
    { label: 'По цене (убывание)', value: 'price-desc' },
    { label: 'По названию (А-Я)', value: 'name-asc' },
    { label: 'По названию (Я-А)', value: 'name-desc' }
]

// Получение списка категорий из загруженных товаров
const categories = computed(() => {
    const uniqueCategories = [...new Set(products.value.map(p => p.category))]
    return [
        { label: 'Все категории', value: null },
        ...uniqueCategories.map(cat => ({ label: cat, value: cat }))
    ]
})

// Получение товаров из Firebase
const fetchProducts = async () => {
    loading.value = true;
    error.value = null;
    try {
        products.value = await getProducts();
    } catch (err) {
        console.error('Ошибка при загрузке товаров:', err);
        error.value = 'Не удалось загрузить данные. Пожалуйста, попробуйте позже.';
    } finally {
        loading.value = false;
    }
};

// Фильтрованные товары для отображения
const filteredProducts = computed(() => {
    let result = products.value

    // Поиск
    if (search.value) {
        const searchLower = search.value.toLowerCase()
        result = result.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        )
    }

    // Фильтрация по категории
    if (category.value) {
        result = result.filter(p => p.category === category.value)
    }

    // Сортировка
    switch (sort.value) {
        case 'price-asc':
            result = result.slice().sort((a, b) => a.price - b.price)
            break
        case 'price-desc':
            result = result.slice().sort((a, b) => b.price - a.price)
            break
        case 'name-asc':
            result = result.slice().sort((a, b) => a.name.localeCompare(b.name))
            break
        case 'name-desc':
            result = result.slice().sort((a, b) => b.name.localeCompare(a.name))
            break
    }

    return result
})

// Загрузка товаров при монтировании компонента
onMounted(fetchProducts);

// Добавление товара в корзину
const addToCart = inject('addToCart')

// Инициализация фэнтези товаров
const initializeFantasyProducts = async () => {
    try {
        initializing.value = true
        const result = await addFantasyProducts()

        if (result) {
            $q.notify({
                color: 'positive',
                message: 'Фэнтези товары успешно добавлены!',
                icon: 'check'
            })
            await fetchProducts() // Обновляем список товаров
        } else {
            $q.notify({
                color: 'negative',
                message: 'Не удалось добавить товары',
                icon: 'error'
            })
        }
    } catch (error) {
        console.error('Ошибка при добавлении товаров:', error)
        $q.notify({
            color: 'negative',
            message: 'Произошла ошибка: ' + error.message,
            icon: 'error'
        })
    } finally {
        initializing.value = false
    }
}
</script>

<style scoped>
.filters-container {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
}

.q-select,
.q-input {
    width: 100%;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
    justify-items: center;
}

@media (max-width: 599px) {
    .q-page {
        padding: 8px !important;
    }

    .filters-container {
        padding: 12px;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 8px;
    }
}

@media (min-width: 600px) and (max-width: 1023px) {
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
}
</style>