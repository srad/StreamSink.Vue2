import { defineStore } from "pinia";

export type ChannelsViewLayout = "grid" | "list";

export type SettingsState = {
  videoVolume: number;
  videoMuted: boolean;
  channelsView: ChannelsViewLayout;
};

export const useSettingsStore = defineStore("settings", {
  persist: true,
  state: (): SettingsState => ({
    channelsView: "list",
    videoVolume: 1.0,
    videoMuted: true,
  }),
  actions: {
    mute() {
      this.videoMuted = true;
    },
    unmute() {
      this.videoMuted = false;
    },
    setVolume(volume: number) {
      this.videoVolume = volume;
    },
    setChannelsLayout(layout: ChannelsViewLayout) {
      this.channelsView = layout;
    },
  },
  getters: {
    isMuted(state: SettingsState): boolean {
      return state.videoMuted;
    },
    getVolume(state: SettingsState): number {
      return state.videoVolume;
    },
    isChannelsGridLayout(state: SettingsState): boolean {
      return state.channelsView === "grid";
    },
    isChannelsListLayout(state: SettingsState): boolean {
      return state.channelsView === "list";
    }
  },
});
