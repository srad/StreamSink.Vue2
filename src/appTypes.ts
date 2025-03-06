import type { DatabaseJob, DatabaseJob as Job, ServicesChannelInfo as ChannelInfo } from "./services/api/v1/StreamSinkClient";

export enum AlertType {
  Default,
  Info,
  Warn,
  Error,
  Success,
  Secondary,
  Light,
  Dark,
}

export type TaskInfo = {
  steps: number;
  step: number;
  pid: number;
  command: string;
  message: string;
};

export type JobMessage<T> = {
  data: T;
  job: Job;
};

export type TaskComplete = {
  steps: number;
  step: number;
  message: string;
};

export type TaskProgress = {
  current: number;
  total: number;
  steps: number;
  step: number;
  message: string;
};

export type JobState = {
  jobs: Job[];
  jobsCount: number;
};

export type ToastState = {
  toasts: Toast[];
};

export type ToastKind = "success" | "error" | "warning" | "info";

export type Toast = {
  title: string;
  message: string;
  hide: boolean;
  created: Date;
  countdown: number;
  kind: ToastKind;
};

export type AuthState = {
  loggedIn: boolean;
  token: string | null | undefined;
};

export type ChannelState = {
  channels: ChannelInfo[];
};

export type Marking = {
  selected?: boolean;
  start: number;
  end: number;
  timestart: number;
  timeend: number;
};

export type AuthHeader = {
  Authorization: string;
};

export type ChannelUpdate = {
  isPaused: boolean;
  channelId: number;
  channelName: string;
  url: string;
  displayName: string;
  skipStart: number;
  minDuration: number;
};

export type JobTableItem = DatabaseJob & {
  createdAtFromNow: string;
  startedFromNow?: string;
  completedAtFromNow?: string;
  jobDuration?: string;
};
