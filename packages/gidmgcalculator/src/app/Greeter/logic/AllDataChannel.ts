import type { AllData } from "@/services";

type AllDataMessageRequest = {
  type: "REQUEST";
};

type AllDataMessageResponse = {
  type: "RESPONSE";
  data: AllData;
};

type AllDataMessage = AllDataMessageRequest | AllDataMessageResponse;

export class AllDataChannel {
  private channel = new BroadcastChannel("ALL_DATA");
  private isClosed = false;

  onRequest() {}

  onResponse(data: AllData) {}

  constructor() {
    this.channel.onmessage = ({ data }: MessageEvent<AllDataMessage>) => {
      switch (data.type) {
        case "REQUEST":
          this.onRequest();
          break;
        case "RESPONSE":
          this.onResponse(data.data);
          break;
      }
    };
  }

  private postMessage(message: AllDataMessage) {
    if (!this.isClosed) {
      this.channel.postMessage(message);
    }
  }

  request() {
    this.postMessage({ type: "REQUEST" });
  }

  response(allData: AllData) {
    this.postMessage({ type: "RESPONSE", data: allData });
  }

  close() {
    try {
      this.channel.close();
      this.isClosed = true;
    } catch (error) {
      //
    }
  }
}
