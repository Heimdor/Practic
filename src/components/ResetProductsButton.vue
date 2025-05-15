<template>
    <div>
        <q-btn color="accent" label="Загрузить фэнтези товары" icon="magic" :loading="loading" @click="resetProducts"
            class="q-mb-md" />
        <q-dialog v-model="confirmDialog">
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="warning" color="warning" text-color="white" />
                    <span class="q-ml-sm">Эта операция удалит все существующие товары и заменит их на фэнтези-товары.
                        Продолжить?</span>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Отмена" color="primary" v-close-popup />
                    <q-btn flat label="Подтвердить" color="accent" @click="confirmReset" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { resetWithFantasyProducts } from 'src/data/fantasy-products'

const $q = useQuasar()
const loading = ref(false)
const confirmDialog = ref(false)

const resetProducts = () => {
    confirmDialog.value = true
}

const confirmReset = async () => {
    try {
        loading.value = true
        const result = await resetWithFantasyProducts()

        if (result) {
            $q.notify({
                color: 'positive',
                message: 'Фэнтези товары успешно загружены!',
                icon: 'check'
            })
            emit('products-reset')
        } else {
            $q.notify({
                color: 'negative',
                message: 'Произошла ошибка при сбросе товаров',
                icon: 'error'
            })
        }
    } catch (error) {
        console.error('Error resetting products:', error)
        $q.notify({
            color: 'negative',
            message: 'Произошла ошибка: ' + error.message,
            icon: 'error'
        })
    } finally {
        loading.value = false
    }
}

const emit = defineEmits(['products-reset'])
</script>