<template>
    <div class="fantasy-categories q-py-lg">
        <h2 class="text-center fantasy-title q-mb-lg">Мир фэнтези в вашем распоряжении</h2>

        <div class="row q-col-gutter-lg">
            <div class="col-12 col-sm-6 col-md-3" v-for="category in categories" :key="category.name">
                <q-card class="fantasy-category-card" @click="goToCategory(category.name)">
                    <q-card-section class="text-center">
                        <q-icon :name="category.icon" size="3.5rem" color="primary" />
                        <h3 class="q-mt-md fantasy-subtitle">{{ category.name }}</h3>
                        <p class="q-mt-sm">{{ category.description }}</p>
                        
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const categories = [
    {
        name: 'Зелья',
        icon: 'science',
        description: 'Волшебные эликсиры и зелья для любых нужд: от исцеления до невидимости'
    },
    {
        name: 'Оружие',
        icon: 'gavel',
        description: 'Легендарное оружие, выкованное мастерами для настоящих героев'
    },
    {
        name: 'Доспехи',
        icon: 'shield',
        description: 'Прочные доспехи и защитное снаряжение для ваших приключений'
    },
    {
        name: 'Книги',
        icon: 'menu_book',
        description: 'Древние фолианты с заклинаниями и знаниями тайных искусств'
    }
]

const goToCategory = (categoryName) => {
    router.push({
        path: '/catalog',
        query: { category: categoryName }
    })
}
</script>

<style scoped>
.fantasy-title {
    font-family: 'Cinzel', serif;
    color: var(--q-primary);
    font-weight: 600;
}

.fantasy-subtitle {
    font-family: 'Cinzel', serif;
    font-weight: 500;
}

.fantasy-category-card {
    height: 100%;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    border: 1px solid rgba(var(--q-primary-rgb), 0.1);
    background: linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%);
}

.fantasy-category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(var(--q-primary-rgb), 0.15);
}
</style>