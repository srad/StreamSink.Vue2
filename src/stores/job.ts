import type { DatabaseJob as Job } from "../services/api/v1/StreamSinkClient";
import { DatabaseJobStatus } from "../services/api/v1/StreamSinkClient";
import { defineStore } from "pinia";
import type { JobMessage, JobState, TaskComplete, TaskInfo, TaskProgress } from "../appTypes";

export const useJobStore = defineStore("job", {
  persist: false,
  state(): JobState {
    return {
      jobs: [],
      jobsCount: 0,
    };
  },
  getters: {
    getJobs(): Job[] {
      return this.jobs || [];
    },
    getOpen(): Job[] {
      return (this.jobs || []).filter((x) => x.status === DatabaseJobStatus.StatusJobOpen);
    },
  },
  actions: {
    create(job: Job) {
      this.jobs.push(job);
      this.jobsCount += 1;
    },
    dec() {
      this.jobsCount = Math.max(this.jobsCount - 1, 0);
    },
    // Just load 100 jobs for the initial state.
    deleteChannel(channelId: number) {
      this.jobs = this.jobs.filter((x: Job) => x.channelId !== channelId);
    },
    deleteRecording(recordingId: number) {
      this.jobs = this.jobs.filter((x: Job) => x.recordingId !== recordingId);
    },
    destroy(jobId: number) {
      this.jobs = this.jobs.filter((x: Job) => x.jobId !== jobId);
    },
    done(message: JobMessage<TaskComplete>) {
      this.destroy(message.job.jobId);
      this.dec();
    },
    inactive(job: Job) {
      const i = this.jobs.findIndex((j: Job) => j.jobId === job.jobId);
      if (i !== -1) {
        this.jobs[i]!.active = false;
      }
    },
    progress(message: JobMessage<TaskProgress>) {
      const i = this.jobs.findIndex((j) => j.jobId === message.job.jobId);
      const progress = String((((message.data.step / message.data.steps) * message.data.current) / message.data.total) * 100);
      if (i !== -1) {
        this.jobs[i]!.progress = progress;
        this.jobs[i]!.info = message.data.message;
      } else {
        this.jobs.unshift(message.job);
        this.jobs[0]!.progress = progress;
        this.jobs[0]!.info = message.data.message;
      }
    },
    refresh(data: { jobs: Job[]; totalCount: number }) {
      this.jobs = data.jobs;
      this.jobsCount = data.totalCount;
    },
    start(message: JobMessage<TaskInfo>) {
      let i = this.jobs.findIndex((j: Job) => j.jobId === message.job.jobId);
      if (i === -1) {
        this.jobs.unshift(message.job);
        i = 0;
      }
      this.jobs[i]!.active = true;
      this.jobs[i]!.pid = message.data.pid;
      this.jobs[i]!.command = message.data.command;
    },
  },
});
