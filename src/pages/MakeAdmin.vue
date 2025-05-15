<template>
    <q-page class="q-pa-md">
        <div class="row justify-center">
            <div class="col-12 col-md-6">
                <q-card>
                    <q-card-section>
                        <div class="text-h6">Назначение администратора</div>
                    </q-card-section>

                    <q-card-section>
                        <p>
                            Используйте эту форму только для первоначального назначения администратора.
                            После создания первого администратора, удалите этот файл или ограничьте доступ к нему.
                        </p>

                        <q-input v-model="email" label="Email пользователя" outlined class="q-mb-md"
                            :rules="[val => !!val || 'Email обязателен']" />

                        <q-input v-model="adminKey" label="Ключ для назначения администратора" outlined type="password"
                            class="q-mb-md" :rules="[val => !!val || 'Ключ обязателен']" />

                        <div class="text-caption q-mb-md">
                            Ключ по умолчанию: "admin123". Вы должны изменить его в коде перед деплоем.
                        </div>
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn color="primary" label="Назначить администратора" @click="makeAdmin" :loading="loading" />
                    </q-card-actions>
                </q-card>

                <q-card v-if="result" class="q-mt-md" :class="result.success ? 'bg-positive' : 'bg-negative'">
                    <q-card-section>
                        <div class="text-h6">{{ result.success ? 'Успех' : 'Ошибка' }}</div>
                        <p>{{ result.message }}</p>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { db, collection, query, where, getDocs, doc, updateDoc, addDoc } from 'src/boot/firebase';

const $q = useQuasar();
const email = ref('');
const adminKey = ref('');
const loading = ref(false);
const result = ref(null);

// Этот ключ следует изменить перед использованием!
const ADMIN_SECRET_KEY = 'admin123';

const makeAdmin = async () => {
    if (!email.value || !adminKey.value) {
        $q.notify({
            color: 'negative',
            message: 'Заполните все поля',
            icon: 'error'
        });
        return;
    }

    if (adminKey.value !== ADMIN_SECRET_KEY) {
        result.value = {
            success: false,
            message: 'Неверный ключ для назначения администратора'
        };
        return;
    }

    loading.value = true;
    try {
        // Найти пользователя по email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email.value));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Если пользователь не найден, попробуем создать запись
            const usersCollection = collection(db, 'users');
            await addDoc(usersCollection, {
                email: email.value,
                isAdmin: true,
                createdAt: new Date()
            });

            result.value = {
                success: true,
                message: `Пользователь ${email.value} успешно назначен администратором.`
            };

        } else {
            // Пользователь найден, обновляем права
            const userDoc = querySnapshot.docs[0];
            const userRef = doc(db, 'users', userDoc.id);
            await updateDoc(userRef, {
                isAdmin: true,
                updatedAt: new Date()
            });

            result.value = {
                success: true,
                message: `Пользователь ${email.value} успешно назначен администратором.`
            };
        }
    } catch (error) {
        console.error('Ошибка при назначении администратора:', error);
        result.value = {
            success: false,
            message: `Ошибка: ${error.message}`
        };
    } finally {
        loading.value = false;
    }
};
</script>