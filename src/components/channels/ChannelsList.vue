<template>
  <table class="table table-bordered table-hover table-sm m-0">
    <thead>
    <tr class="align-middle text-center">
      <th rowspan="2" style="width: 1%" class="bg-light p-2">Preview</th>
      <th rowspan="2" style="width: 10%" class="bg-light p-2">Name</th>
      <th rowspan="2" style="width: 20%" class="bg-light p-2">Link</th>
      <th rowspan="2" style="width: 5%" class="bg-light p-2">Favourite?</th>
      <th rowspan="2" style="width: 5%" class="bg-light p-2">Recording?</th>
      <th style="width: 5%" class="bg-light text-center p-2">Count ({{ totalCount }})</th>
      <th style="width: 5%" class="bg-light text-center p-2">Size ({{ totalSize.toFixed(1) }}GB)</th>
    </tr>
    </thead>
    <tbody>
    <tr :key="channel.channelId" v-for="channel in channels" class="align-middle">
      <td class="text-center p-0">
        <img alt="preview" :src="`${fileUrl}/${channel.preview}`" class="rounded" style="height: 50px; width: auto" />
      </td>
      <td class="px-2">
        <RouterLink class="text-decoration-none" :to="`/channel/${channel.channelId}/${channel.channelName}`">
          <h6 class="m-0">{{ channel.channelName }}</h6>
        </RouterLink>
      </td>
      <td>
        <a :href="channel.url" target="_blank">{{ channel.url }}</a>
      </td>
      <td class="px-2 text-center">
        <ChannelFavButton :bookmarked="channel.fav" :channel-id="channel.channelId" />
      </td>
      <td class="px-2 text-center">
        <div v-if="channel.isRecording"><i class="bi text-danger blink bi-record-fill pulse"></i> Recording</div>
      </td>
      <td class="px-2 text-center">{{ channel.recordingsCount }}</td>
      <td class="px-2 text-center">{{ (channel.recordingsSize / 1024 / 1024 / 1024).toFixed(2) }} GB</td>
    </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import ChannelFavButton from "../../components/controls/ChannelFavButton.vue";
import type { ServicesChannelInfo } from "../../services/api/v1/StreamSinkClient";
import { computed, inject } from "vue";

const props = defineProps<{
  channels: ServicesChannelInfo[]
}>();

const fileUrl = inject("fileUrl") as string;

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const totalSize = computed(() => (props.channels || []).map((x) => x.recordingsSize).reduce((a, b) => a + b, 0) / 1024 / 1024 / 1024);
const totalCount = computed(() => (props.channels || []).map((x) => x.recordingsCount).reduce((a, b) => a + b, 0));

</script>

<style scoped>

</style>
