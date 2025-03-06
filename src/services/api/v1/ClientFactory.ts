import { ContentType, type DatabaseRecording, type DatabaseRecording as RecordingResponse } from "./StreamSinkClient";
import { StreamSinkClient, HttpClient } from "./StreamSinkClient";
import AuthService from "@/services/auth.service.ts";

export class MyClient extends StreamSinkClient<unknown> {
  constructor(token: string | null, apiUrl: string) {
    let auth = {};
    if (token) {
      auth = { Authorization: `Bearer ${token}` };
    }
    const client = new HttpClient({
      baseUrl: apiUrl,
      baseApiParams: {
        headers: { ...auth },
      },
    });
    super(client);
  }

  /**
   * Custom function to upload and cancel large files with progress indicator.
   * @param channelId Upload to which channel
   * @param file File object to upload
   * @param progress Returns the progress as number in range [0.0 ... 1.0]
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  channelUpload(channelId: number, file: File, progress: (pcent: number) => void): [Promise<RecordingResponse>, AbortController] {
    const controller = new AbortController();
    const signal = controller.signal;
    const formData = new FormData();
    formData.append("file", file);

    const req = this.http.request<DatabaseRecording>({
      path: `/channels/${channelId}/upload`,
      method: "POST",
      body: formData,
      type: ContentType.FormData,
      signal,
    });

    return [req, controller];
  }

  async isRecording(): Promise<boolean> {
    const { isRecording } = await this.recorder.recorderList();
    return isRecording;
  }
}

export const createClient = (token?: string | null, apiUrl?: string): MyClient => {
  return new MyClient(token || AuthService.getToken(), apiUrl || import.meta.env.API_URL);
};
