import type {
  DatabaseChannel,
  DatabaseRecording,
  RequestsChannelRequest as ChannelRequest,
  ServicesChannelInfo,
  ServicesChannelInfo as ChannelInfo
} from "../services/api/v1/StreamSinkClient";
import { defineStore } from "pinia";
import type { ChannelState } from "../appTypes";
import { createClient } from "../services/api/v1/ClientFactory";
import { useJobStore } from "../stores/job";

export const useChannelStore = defineStore("channel", {
  state: (): ChannelState => ({
    channels: [],
  }),
  actions: {
    addRecording(r: DatabaseRecording) {
      this.channels.find((x: ChannelInfo) => x.channelId === r.channelId)?.recordings?.push(r);
    },
    async load() {
      const client = createClient();
      const data = await client.channels.channelsList();
      this.channels = data || [];
    },
    save(channel: ChannelRequest): Promise<ServicesChannelInfo> {
      return new Promise((resolve, reject) => {
        const client = createClient();
        client.channels
          .channelsCreate(channel)
          .then((res) => {
            this.add(res);
            resolve(res);
          })
          .catch((res) => reject(res.error));
      });
    },
    online(channelId: number) {
      const i = this.channels.findIndex((ch: ChannelInfo) => ch.channelId === channelId);
      if (i !== -1) {
        this.channels[i]!.isOnline = true;
      }
    },
    offline(channelId: number) {
      const i = this.channels.findIndex((ch: ChannelInfo) => ch.channelId === channelId);
      if (i !== -1) {
        this.channels[i]!.isOnline = false;
        this.channels[i]!.isRecording = false;
      }
    },
    thumbnail(channelId: number) {
      const index = this.channels.findIndex((ch: ChannelInfo) => ch.channelId === channelId);
      if (index !== -1) {
        // Refresh cache with url timestamp update.
        this.channels[index]!.preview = this.channels[index]!.preview.split("?")[0] + `?time=${Date.now()}`;
      }
    },
    start(channelId: number) {
      const i = this.channels.findIndex((ch: ChannelInfo) => ch.channelId === channelId);
      if (i !== -1) {
        this.channels[i]!.isRecording = true;
        this.channels[i]!.isOnline = true;
      }
    },
    add(channel: ChannelInfo) {
      if (!this.channels.some((c: ChannelInfo) => c.channelId === channel.channelId)) {
        this.channels.push(channel);
      }
    },
    update(channel: DatabaseChannel) {
      const i = this.channels.findIndex((c: ChannelInfo) => c.channelId === channel.channelId);
      if (i !== -1) {
        const ch = this.channels[i] as ChannelInfo;
        Object.keys(channel).forEach((key: string) => {
          //@ts-expect-error type nonsesense
          ch[key] = channel[key];
        });
      }
    },
    destroy(channelId: number) {
      this.channels = this.channels.filter((x: ChannelInfo) => x.channelId !== channelId);
      const jobStore = useJobStore();
      jobStore.deleteChannel(channelId);
    },
    pause(channelId: number) {
      const i = this.channels.findIndex((c: ChannelInfo) => c.channelId === channelId);
      if (i !== -1) {
        this.channels[i]!.isRecording = false;
        this.channels[i]!.isPaused = true;
      }
    },
    resume(channelId: number) {
      const i = this.channels.findIndex((c: ChannelInfo) => c.channelId === channelId);
      if (i !== -1) {
        this.channels[i]!.isPaused = false;
      }
    },
    fav(id: number) {
      const i = this.channels.findIndex((ch: ChannelInfo) => ch.channelId === id);
      this.channels[i]!.fav = true;
    },
    unfav(id: number) {
      const i = this.channels.findIndex((ch: ChannelInfo) => ch.channelId === id);
      this.channels[i]!.fav = false;
    },
    clear() {
      this.channels = [];
    },
    stop() {
      for (let i = 0; i < this.channels.length; i += 1) {
        this.channels[i]!.isRecording = false;
      }
    },
  },
});
