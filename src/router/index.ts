import { createRouter, createWebHistory } from "vue-router";
import StreamView from "../views/StreamsView.vue";
import FilterView from "../views/FilterView.vue";
import BookmarkView from "../views/BookmarksView.vue";
import VideoView from "../views/RecordingView.vue";
import LogView from "../views/LogsView.vue";
import JobView from "../views/JobView.vue";
import AdminView from "../views/AdminView.vue";
import ChannelView from "../views/ChannelView.vue";
import RandomView from "../views/RandomView.vue";
import ChannelsView from "../views/ChannelsView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import AuthService from "../services/auth.service.ts";

const routes = [
  { path: "", redirect: "/streams" },
  { path: "/", redirect: "/streams/live/tab" },
  { path: "/login", name: "Login", component: LoginView, meta: { title: "Login" } },
  { path: "/register", name: "Register", component: RegisterView, meta: { title: "Register" } },
  {
    path: "/channel/:id/:channelName",
    name: "Channels",
    component: ChannelsView,
    meta: { title: "Channel" },
  },
  { path: "/channels", name: "Channels", component: ChannelsView, meta: { title: "Channels" } },
  { path: "/admin", name: "Admin", component: AdminView, meta: { title: "Admin" } },
  { path: "/jobs/:tab?", name: "Job", component: JobView, meta: { title: "Jobs" } },
  {
    path: "/streams/:tab/tab/:tag?",
    name: "Stream",
    component: StreamView,
    meta: { title: "Stream" },
  },
  {
    path: "/channel/:id/:name?",
    name: "Channel",
    component: ChannelView,
    props: true,
    meta: { title: "Channel" },
  },
  { path: "/filter", name: "Filter", component: FilterView, meta: { title: "Latest" } },
  { path: "/random", name: "Random", component: RandomView, meta: { title: "Random" } },
  { path: "/recordings/:id", name: "Video", component: VideoView },
  { path: "/logs", name: "Log", component: LogView },
  { path: "/bookmarks", name: "Bookmark", component: BookmarkView },
  { path: "/:pathMatch(.*)*", redirect: "/streams/live/tab" },
];

const router = createRouter({ history: createWebHistory(), routes });

router.afterEach((to) => {
  //@ts-expect-error Vue nonsense error
  document.title = to.meta.title || "Default Title";
});

router.beforeEach((to, from, next) => {
  const publicPages = ["/login", "/register"];
  const authRequired = !publicPages.includes(to.path);
  const hasAuthHeader = AuthService.getAuthHeader();
  const isLoggedIn = AuthService.isLoggedIn();

  if (isLoggedIn && (to.path === "/login" || to.path === "/register")) {
    next("/");
    return;
  }

  if (isLoggedIn && !authRequired) {
    next();
    return;
  }

  // trying to access a restricted page + not logged in
  // redirect to login page
  if (authRequired && !hasAuthHeader) {
    next("/login");
  } else {
    next();
  }
});

export default router;
