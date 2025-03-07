<template>
  <component :is="layoutComponent">
    <RouterView v-slot="{ Component }">
      <component :is="Component"></component>
    </RouterView>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import { useRoute } from 'vue-router'

const route = useRoute();

const layouts = {
  default: DefaultLayout,
  auth: AuthLayout,
};

//@ts-expect-error nonsense
const layoutComponent = computed(() => layouts[route.meta.layout] || DefaultLayout);

</script>

<style lang="scss">
@import "./assets/main.scss";
</style>
