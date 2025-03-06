<template>
  <NuxtLoadingIndicator/>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { createPinia } from 'pinia';
import { createLog } from '@/utils/log';

createPinia().use(state);

if (import.meta.server) {
  const logger = createLog('App');
  const config = useRuntimeConfig();

  logger.box(`api url: ${config.public.apiUrl}
file url: ${config.public.fileUrl}
base url: ${config.public.baseUrl}
app name: ${config.public.appName}
socket url: ${config.public.socketUrl}`);
}
</script>
