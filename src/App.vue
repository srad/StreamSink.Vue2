<template>
  <div>
    <NavTop v-if="loggedIn" :routes="routes" :title="title" @add="showModal = true" :show-logout="loggedIn" @logout="logout" />

    <main class="container-fluid" :data-logged-in="loggedIn">
      <component :is="layoutComponent">
        <RouterView v-slot="{ Component }">
          <component :is="Component"></component>
        </RouterView>
      </component>

      <ChannelModal v-if="loggedIn" :clear="showModal" :show="showModal" :is-paused="false" :saving="false" title="Add Stream" @save="save" @close="showModal = false" />

      <AppToaster v-if="loggedIn" :toasts="toasts" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { type DatabaseJob, DatabaseJobOrder, DatabaseJobStatus, type RequestsChannelRequest as ChannelRequest } from "@/services/api/v1/StreamSinkClient";
import { closeSocket, connectSocket, MessageType, socketOn } from "@/utils/socket";
import ChannelModal from "@/components/modals/ChannelModal.vue";
import NavTop from "@/components/navs/NavTop.vue";
import AppToaster from "@/components/AppToaster.vue";
import { useChannelStore } from "@/stores/channel";
import { useJobStore } from "@/stores/job";
import { useToastStore } from "@/stores/toast";
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
import type { JobMessage, TaskComplete, TaskInfo, TaskProgress } from "@/appTypes";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { createClient } from "@/services/api/v1/ClientFactory";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import { useAuthStore } from "@/stores/auth.ts";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const channelStore = useChannelStore();
const toastStore = useToastStore();
const jobStore = useJobStore();

const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const title = inject("appName") as string;
const showModal = ref(false);
const saving = ref(false);

const authStore = useAuthStore();

const layouts = {
  default: DefaultLayout,
  auth: AuthLayout,
};

const routes = [
  { icon: "bi-water", url: "/streams/live", title: t("menu.streams") },
  { icon: "bi-list", url: "/channels", title: t("menu.channels") },
  { icon: "bi-stopwatch", url: "/filter", title: t("menu.latest") },
  { icon: "bi-hypnotize", url: "/random", title: t("menu.random") },
  { icon: "bi-star-fill", url: "/bookmarks", title: t("menu.favs") },
  { icon: "bi-eye-fill", url: "/admin", title: t("menu.admin") },
];
// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

//@ts-expect-error nonsense
const layoutComponent = computed(() => layouts[route.meta.layout] || DefaultLayout);
const toasts = computed(() => toastStore.getToast);
const loggedIn = computed(() => authStore.isLoggedIn);

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(
  () => route.query,
  (newQuery) => {
    showModal.value = "channel" in newQuery;
  },
);

watch(showModal, (val) => {
  if (val) {
    router.push({ query: { channel: "add" } });
  } else {
    hideModal();
  }
});

// --------------------------------------------------------------------------------------
// Functions
// --------------------------------------------------------------------------------------

const save = async (data: ChannelRequest) => {
  try {
    saving.value = true;
    await channelStore.save(data);
    hideModal();
  } catch (e) {
    toastStore.error(<{ title: string; message: string }>e);
  } finally {
    saving.value = false;
  }
};

const hideModal = () => {
  const query = { ...route.query };
  delete query.channel;
  router.replace({ path: route.path, query });
};

const logout = () => {
  authStore.logout();
  window.location.assign('/login');
};

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(async () => {
  const client = createClient();
  const data = await client.jobs.listCreate({
    skip: 0,
    take: 100,
    states: [DatabaseJobStatus.StatusJobOpen],
    sortOrder: DatabaseJobOrder.JobOrderASC,
  });

  if (data) {
    jobStore.jobs = data.jobs!;
    jobStore.jobsCount = data.totalCount;
  }

  await connectSocket();

  socketOn(MessageType.JobStart, (message) => {
    const data = message as JobMessage<TaskInfo>;
    jobStore.start(data);
  });

  socketOn(MessageType.JobCreate, (data) => {
    const job = data as DatabaseJob;
    jobStore.create(job);
    toastStore.success({
      title: "Job created",
      message: `File ${job.filename} in ${job.channelName}`,
    });
  });

  // Dispatch
  socketOn(MessageType.JobDone, (message) => {
    jobStore.done(message as JobMessage<TaskComplete>);
  });

  // Dispatch
  socketOn(MessageType.JobDeactivate, (message) => {
    jobStore.done(message as JobMessage<TaskComplete>);
  });

  socketOn(MessageType.JobDelete, (jobId) => {
    const id = jobId as unknown as number;
    jobStore.destroy(id);
    toastStore.success({
      title: "Job destroyed",
      message: `Job id ${id} removed`,
    });
  });

  socketOn(MessageType.JobDeleted, (data) => jobStore.destroy(data as unknown as number));
  socketOn(MessageType.JobProgress, (data) => jobStore.progress(data as JobMessage<TaskProgress>));

  socketOn(MessageType.ChannelOnline, (data) => channelStore.online(data as unknown as number));
  socketOn(MessageType.ChannelOffline, (data) => channelStore.offline(data as unknown as number));
  socketOn(MessageType.ChannelThumbnail, (data) => channelStore.thumbnail(data as unknown as number));

  socketOn(MessageType.ChannelStart, (data) => {
    const id = data as unknown as number;
    channelStore.start(id);
    toastStore.info({ title: "Channel recording", message: `Channel id ${id}` });
  });
});

onUnmounted(() => {
  closeSocket();
});
</script>

<style lang="scss">
@import "./assets/main.scss";
</style>
