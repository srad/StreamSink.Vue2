<template>
  <a>
    <i class="bi bi-star-fill text-warning" @click="emit('fav', props.data, $event)" v-if="faved" @click.stop></i>
    <i v-else class="bi bi-star text-warning" @click="emit('unfav', props.data, $event)" @click.stop></i>
  </a>
</template>

<script setup lang="ts" generic="T">
const emit = defineEmits<{
  (e: 'fav', data: T, event: Event): void
  (e: 'unfav', data: T, event: Event): void
}>();

const props = defineProps<{
  faved: boolean
  data: T
}>();
</script>

<style scoped>
</style>
