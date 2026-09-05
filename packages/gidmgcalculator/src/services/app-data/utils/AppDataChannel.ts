import { Subject } from "ron-utils";
import type { AppData } from "../types";

type MessageRequest = {
  type: "REQUEST";
};

type MessageResponse = {
  type: "RESPONSE";
  data: AppData;
};

type Message = MessageRequest | MessageResponse;

export class AppDataChannel {
  private channel = new BroadcastChannel("ALL_DATA");
  private isClosed = false;

  private dataSubject = new Subject<AppData>();

  onRequest() {}

  constructor() {
    this.channel.onmessage = ({ data }: MessageEvent<Message>) => {
      switch (data.type) {
        case "REQUEST":
          this.onRequest();
          break;
        case "RESPONSE":
          this.dataSubject.next(data.data);
          this.dataSubject.subscribers = new Set();
          break;
      }
    };
  }

  private postMessage(message: Message) {
    if (!this.isClosed) {
      this.channel.postMessage(message);
    }
  }

  request() {
    const promise = new Promise<AppData | null>((resolve) => {
      const unsubscribe = this.dataSubject.subscribe((data) => {
        resolve(data);
      });

      setTimeout(() => {
        unsubscribe();
        resolve(null);
      }, 200);
    });

    this.postMessage({ type: "REQUEST" });

    return promise;
  }

  response(appData: AppData) {
    this.postMessage({ type: "RESPONSE", data: appData });
  }

  close() {
    try {
      this.channel.close();
      this.isClosed = true;
    } catch {
      //
    }
  }
}
