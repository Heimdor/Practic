<template>
    <q-page padding>
        <div class="row q-mb-lg">
            <div class="col-12">
                <h4 class="q-mb-md">Управление товарами</h4>
                <div class="row q-col-gutter-md">
                    <div class="col-auto">
                        <q-btn color="primary" icon="add" label="Добавить товар" @click="openProductForm" />
                    </div>
                    <div class="col-auto">
                        <ResetProductsButton @products-reset="fetchProducts" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Загрузка и ошибки -->
        <div v-if="loading" class="text-center q-py-lg">
            <q-spinner-dots color="primary" size="40px" />
            <div class="q-mt-sm text-grey-8">Загрузка данных...</div>
        </div>

        <div v-else-if="error" class="text-center q-py-lg">
            <q-icon name="error" color="negative" size="2rem" />
            <div class="q-mt-sm text-grey-8">{{ error }}</div>
            <q-btn flat color="primary" label="Повторить" @click="fetchProducts" class="q-mt-sm" />
        </div>

        <!-- Список товаров -->
        <div v-else>
            <q-table :rows="products" :columns="columns" row-key="id" :pagination="{ rowsPerPage: 10 }" flat bordered>
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="image" :props="props">
                            <q-img :src="props.row.image" :ratio="1" style="max-width: 80px" />
                        </q-td>
                        <q-td key="name" :props="props">{{ props.row.name }}</q-td>
                        <q-td key="price" :props="props">{{ formatPrice(props.row.price) }} ₽</q-td>
                        <q-td key="category" :props="props">{{ props.row.category }}</q-td>
                        <q-td key="actions" :props="props">
                            <q-btn flat round dense color="primary" icon="edit" @click="editProduct(props.row)" />
                            <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)" />
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>

        <!-- Форма товара -->
        <q-dialog v-model="formDialog" persistent>
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">{{ editMode ? 'Редактировать товар' : 'Добавить товар' }}</div>
                </q-card-section>

                <q-card-section>
                    <q-form @submit="saveProduct">
                        <q-input v-model="form.name" label="Название" :rules="[val => !!val || 'Обязательное поле']" />

                        <q-input v-model.number="form.price" type="number" label="Цена"
                            :rules="[val => !!val || 'Обязательное поле', val => val > 0 || 'Цена должна быть больше 0']" />

                        <q-input v-model="form.category" label="Категория"
                            :rules="[val => !!val || 'Обязательное поле']" />

                        <q-input v-model="form.image" label="URL изображения"
                            :rules="[val => !!val || 'Обязательное поле']" />

                        <q-input v-model="form.description" type="textarea" label="Описание"
                            :rules="[val => !!val || 'Обязательное поле']" />
                    </q-form>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Отмена" color="grey-7" v-close-popup />
                    <q-btn unelevated color="primary" :label="editMode ? 'Сохранить' : 'Добавить'"
                        @click="saveProduct" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Подтверждение удаления -->
        <q-dialog v-model="deleteDialog">
            <q-card>
                <q-card-section>
                    <div class="text-h6">Подтверждение удаления</div>
                </q-card-section>

                <q-card-section>
                    Вы уверены, что хотите удалить товар "{{ selectedProduct?.name }}"?
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Отмена" color="grey-7" v-close-popup />
                    <q-btn unelevated color="negative" label="Удалить" @click="deleteSelectedProduct" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { getProducts, addProduct, updateProduct, deleteProduct } from 'src/boot/firebase';
import ResetProductsButton from 'src/components/ResetProductsButton.vue';

const $q = useQuasar();

// Состояние данных
const products = ref([]);
const loading = ref(true);
const error = ref(null);

// Состояние формы
const formDialog = ref(false);
const editMode = ref(false);
const form = ref({
    name: '',
    price: 0,
    category: '',
    image: '',
    description: ''
});

// Состояние удаления
const deleteDialog = ref(false);
const selectedProduct = ref(null);

// Определение колонок для таблицы
const columns = [
    { name: 'image', required: true, label: 'Изображение', align: 'left', field: 'image' },
    { name: 'name', required: true, label: 'Название', align: 'left', field: 'name', sortable: true },
    { name: 'price', required: true, label: 'Цена', align: 'left', field: 'price', sortable: true },
    { name: 'category', required: true, label: 'Категория', align: 'left', field: 'category', sortable: true },
    { name: 'actions', required: true, label: 'Действия', align: 'center' },
];

// Получение данных о товарах из Firestore
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

// Открыть форму для создания нового товара
const openProductForm = () => {
    editMode.value = false;
    form.value = {
        name: '',
        price: 0,
        category: '',
        image: '',
        description: ''
    };
    formDialog.value = true;
};

// Открыть форму для редактирования товара
const editProduct = (product) => {
    editMode.value = true;
    form.value = { ...product };
    formDialog.value = true;
};

// Сохранить товар (добавить новый или обновить существующий)
const saveProduct = async () => {
    try {
        if (editMode.value) {
            // Получаем id из формы и удаляем его из данных для обновления
            const { id, ...productData } = form.value;
            await updateProduct(id, productData);
            $q.notify({
                color: 'positive',
                message: 'Товар успешно обновлен',
                icon: 'check'
            });
        } else {
            await addProduct(form.value);
            $q.notify({
                color: 'positive',
                message: 'Товар успешно добавлен',
                icon: 'check'
            });
        }
        formDialog.value = false;
        fetchProducts();
    } catch (err) {
        console.error('Ошибка при сохранении товара:', err);
        $q.notify({
            color: 'negative',
            message: 'Не удалось сохранить товар',
            icon: 'error'
        });
    }
};

// Подтверждение удаления товара
const confirmDelete = (product) => {
    selectedProduct.value = product;
    deleteDialog.value = true;
};

// Удаление товара
const deleteSelectedProduct = async () => {
    try {
        await deleteProduct(selectedProduct.value.id);
        $q.notify({
            color: 'positive',
            message: 'Товар успешно удален',
            icon: 'check'
        });
        deleteDialog.value = false;
        fetchProducts();
    } catch (err) {
        console.error('Ошибка при удалении товара:', err);
        $q.notify({
            color: 'negative',
            message: 'Не удалось удалить товар',
            icon: 'error'
        });
    }
};

// Форматирование цены
const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
};

// Загрузка товаров при монтировании компонента
onMounted(fetchProducts);
</script>

<style scoped>
.q-table td {
    vertical-align: middle;
}

.q-form>* {
    margin-bottom: 16px;
}
</style>