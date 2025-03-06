<template>
  <img class="w-100 h-auto" alt="preview" :src="props.previewImage" v-if="!props.previewVideo"/>
  <video v-else ref="video" loop muted playsinline
         class="w-100 h-auto"
         style="user-select: none; z-index: 0;"
         :poster="props.previewImage"
         @click="emit('selected', props.data)"
         @contextmenu="context($event)"
         @error="errorLoadImage"
         @mouseleave="leaveVideo()"
         @mouseover="hoverVideo()"
         @touchend="leaveVideo()"
         @touchstart="hoverVideo()">
    <source :src="previewVideo">
  </video>
</template>

<script setup lang="ts">
import { useTemplateRef, ref } from 'vue';

const emit = defineEmits<{ (e: 'selected', value: string | number): void }>();

const video = useTemplateRef<HTMLVideoElement>('video');

const errorLoad = ref(false);

const props = defineProps<{
  data: string | number
  previewImage?: string
  previewVideo?: string
}>();

const context = (e: Event) => e.preventDefault();

const hoverVideo = async () => {
  if (video.value) {
    video.value.playbackRate = 16;
    await video.value.play();
    video.value?.removeAttribute('poster');
  }
};

const leaveVideo = () => video.value?.pause();

const errorLoadImage = () => errorLoad.value = true;
</script>

<style scoped>
.preview-container img, .preview-container video {
  width: 100%;
  height: auto;
  vertical-align: middle;
  z-index: -1;
}

video.missing {
  filter: blur(4px);
  clip-path: inset(0);
}
</style>
