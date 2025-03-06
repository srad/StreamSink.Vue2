import { defineStore } from "pinia";
import type { AuthState } from "../appTypes";
import AuthService from "@/services/auth.service";
import type { RequestsAuthenticationRequest } from "@/services/api/v1/StreamSinkClient.ts";

export const useAuthStore = defineStore("auth", {
  persist: true,
  state: (): AuthState => ({
    loggedIn: false,
    token: null,
  }),
  actions: {
    async login(user: RequestsAuthenticationRequest) {
      const token = await AuthService.login(user);
      this.token = token;
      this.loggedIn = true;
    },
    logout() {
      this.token = null;
      this.loggedIn = false;
    },
    async register(user: RequestsAuthenticationRequest) {
      await AuthService.signup(user);
    }
  },
  getters: {
    isLoggedIn(): boolean {
      return this.token != null && this.token != undefined;
    },
    getToken(): string | null | undefined {
      return this.token
    },
  },
});
