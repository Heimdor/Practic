<template>
    <q-footer elevated class="bg-primary text-white compact-footer">
        <div class="row justify-between items-center q-px-md">
            <div class="row items-center">
                <q-icon name="auto_awesome" size="14px" class="q-mr-xs text-accent" />
                <span class="text-caption fantasy-text">Fantasy Shop</span>
            </div>

            <q-btn v-if="!((currentRoute === '/' || currentRoute === '/login') && !isAuthenticated)" flat round dense
                icon="shopping_cart" size="xs" class="q-ml-sm cart-button" @click="$emit('open-cart')">
                <q-badge v-if="cartItemsCount > 0" color="negative" floating class="cart-badge">
                    {{ cartItemsCount }}
                </q-badge>
            </q-btn>
        </div>
    </q-footer>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const currentRoute = computed(() => route.path)

const props = defineProps({
    cartItemsCount: {
        type: Number,
        default: 0
    },
    isAuthenticated: {
        type: Boolean,
        default: false
    }
})

defineEmits(['open-cart'])
</script>

<style scoped>
.compact-footer {
    min-height: 25px;
    height: 25px;
    box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.15);
    padding: 0;
    background-image: linear-gradient(135deg, #2c1d54, #462b82) !important;
}

.cart-button {
    position: relative;
    transition: transform 0.3s ease;
    color: #e9c46a;
}

.cart-button:hover {
    transform: scale(1.1);
}

.cart-badge {
    border-radius: 50%;
    font-size: 0.6rem;
    height: 10px;
    min-width: 10px;
    padding: 0 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.fantasy-text {
    font-family: 'Cinzel', serif;
    letter-spacing: 0.5px;
    color: #e9c46a;
}
</style>