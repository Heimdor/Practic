<template>
    <q-page class="q-pa-md">
        <div class="row q-mb-md justify-between items-center">
            <h1 class="text-h5 q-my-none text-primary">Избранные товары</h1>
            <div>
                <q-btn v-if="favoriteItems.length > 0" flat color="negative" icon="delete_sweep"
                    label="Очистить избранное" @click="confirmClearFavorites" />
                <q-btn to="/catalog" color="primary" icon="shopping_bag" label="В каталог" class="q-ml-sm" />
            </div>
        </div>

        <!-- Фильтры и сортировка -->
        <div v-if="favoriteItems.length > 0"
            class="filtering-sorting-container q-mb-md q-pa-md rounded-card card-gradient-light">
            <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-md-4">
                    <q-input v-model="searchQuery" outlined dense clearable placeholder="Поиск по названию"
                        class="search-input">
                        <template v-slot:prepend>
                            <q-icon name="search" />
                        </template>
                        <template v-slot:append v-if="searchQuery">
                            <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
                        </template>
                    </q-input>
                </div>
                <div class="col-12 col-md-4">
                    <q-select v-model="sortOption" :options="sortOptions" outlined dense label="Сортировка"
                        class="sort-select">
                        <template v-slot:prepend>
                            <q-icon name="sort" />
                        </template>
                    </q-select>
                </div>
                <div class="col-12 col-md-4">
                    <q-select v-model="categoryFilter" :options="categoryOptions" outlined dense label="Категория"
                        class="category-select">
                        <template v-slot:prepend>
                            <q-icon name="category" />
                        </template>
                    </q-select>
                </div>
            </div>

            <div class="row justify-between items-center q-mt-sm">
                <div class="text-body2 text-grey-7">
                    Показано: {{ filteredItems.length }} из {{ favoriteItems.length }}
                </div>
                <q-btn flat color="primary" icon="refresh" label="Сбросить фильтры" @click="resetFilters"
                    :disable="!isFilterActive" />
            </div>
        </div>

        <!-- Избранные товары найдены -->
        <div v-if="favoriteItems.length > 0" class="products-grid">
            <template v-if="filteredItems.length > 0">
                <ProductCard v-for="product in filteredItems" :key="product.id" :product="product" />
            </template>
            <div v-else class="col-12 text-center q-py-xl">
                <q-icon name="search_off" size="60px" color="grey-7" />
                <div class="text-h6 q-mt-md">Товары не найдены</div>
                <div class="text-subtitle2 text-grey-7 q-mb-md">
                    Попробуйте изменить параметры поиска или фильтры
                </div>
                <q-btn color="primary" flat icon="refresh" label="Сбросить фильтры" @click="resetFilters" />
            </div>
        </div>

        <!-- Избранных товаров нет -->
        <div v-else class="text-center q-py-xl">
            <q-icon name="favorite_border" size="60px" color="grey-7" />
            <div class="text-h6 q-mt-md">У вас пока нет избранных товаров</div>
            <div class="text-subtitle2 text-grey-7 q-mb-md">Добавьте понравившиеся товары в избранное, нажав на иконку ♡
            </div>
            <q-btn color="primary" icon="shopping_bag" label="Перейти в каталог" to="/catalog" class="q-mt-md" />
        </div>

        <!-- Диалог подтверждения очистки избранного -->
        <q-dialog v-model="clearDialog">
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="warning" color="warning" text-color="white" />
                    <span class="q-ml-sm">Вы уверены, что хотите удалить все товары из избранного?</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Отмена" color="primary" v-close-popup />
                    <q-btn flat label="Удалить" color="negative" @click="clearFavorites" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useFavoritesStore } from 'src/stores/favorites'
import ProductCard from 'src/components/ProductCard.vue'

const $q = useQuasar()
const favoritesStore = useFavoritesStore()
const clearDialog = ref(false)

// Получаем список избранных товаров из хранилища через компьютед
const favoriteItems = computed(() => favoritesStore.favoriteItems)

// Состояние фильтров и сортировки
const searchQuery = ref('')
const sortOption = ref({ label: 'По умолчанию', value: 'default' })
const categoryFilter = ref(null)

// Опции сортировки
const sortOptions = [
    { label: 'По умолчанию', value: 'default' },
    { label: 'По цене (возрастанию)', value: 'price-asc' },
    { label: 'По цене (убыванию)', value: 'price-desc' },
    { label: 'По названию (А-Я)', value: 'name-asc' },
    { label: 'По названию (Я-А)', value: 'name-desc' },
]

// Динамическое создание опций категорий из имеющихся товаров
const categoryOptions = computed(() => {
    const categories = [...new Set(favoriteItems.value.map(item => item.category))]
    return [
        { label: 'Все категории', value: null },
        ...categories.map(cat => ({ label: cat, value: cat }))
    ]
})

// Проверка, активны ли фильтры
const isFilterActive = computed(() => {
    return searchQuery.value !== '' ||
        sortOption.value.value !== 'default' ||
        categoryFilter.value !== null
})

// Фильтрация и сортировка товаров
const filteredItems = computed(() => {
    let result = [...favoriteItems.value]

    // Фильтрация по поиску
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        )
    }

    // Фильтрация по категории
    if (categoryFilter.value) {
        result = result.filter(item => item.category === categoryFilter.value)
    }

    // Сортировка
    switch (sortOption.value.value) {
        case 'price-asc':
            result.sort((a, b) => a.price - b.price)
            break
        case 'price-desc':
            result.sort((a, b) => b.price - a.price)
            break
        case 'name-asc':
            result.sort((a, b) => a.name.localeCompare(b.name))
            break
        case 'name-desc':
            result.sort((a, b) => b.name.localeCompare(a.name))
            break
        default:
            // По умолчанию не сортируем, оставляем порядок из хранилища
            break
    }

    return result
})

// Сброс всех фильтров
const resetFilters = () => {
    searchQuery.value = ''
    sortOption.value = { label: 'По умолчанию', value: 'default' }
    categoryFilter.value = null
}

// Открыть диалог подтверждения очистки
const confirmClearFavorites = () => {
    clearDialog.value = true
}

// Очистить избранное
const clearFavorites = () => {
    favoritesStore.clearFavorites()
    clearDialog.value = false // Закрываем диалог сразу
    resetFilters() // Сбрасываем фильтры
    $q.notify({
        color: 'negative',
        message: 'Все товары удалены из избранного',
        icon: 'delete_sweep'
    })
}
</script>

<style scoped>
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
    justify-items: center;
}

.filtering-sorting-container {
    transition: all 0.3s ease;
    border: 1px solid #e0e0e0;
}

.filtering-sorting-container:hover {
    box-shadow: var(--magic-glow);
}

.search-input,
.sort-select,
.category-select {
    transition: all 0.3s ease;
}

.search-input:focus-within,
.sort-select:focus-within,
.category-select:focus-within {
    transform: translateY(-2px);
    box-shadow: var(--magic-glow);
}

@media (max-width: 599px) {
    .q-page {
        padding: 8px !important;
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