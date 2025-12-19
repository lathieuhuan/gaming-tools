import type { AllData } from "@/services";

type AllDataMessageRequest = {
  type: "REQUEST";
};

type AllDataMessageResponse = {
  type: "RESPONSE";
  data: AllData;
};

export class AllDataChannel {
  private channel = new BroadcastChannel("ALL_DATA");
  private isClosedChannel = false;

  onRequest = () => {};

  onResponse = (data: AllData) => {};

  constructor() {
    this.channel.onmessage = ({ data }: MessageEvent<AllDataMessageRequest | AllDataMessageResponse>) => {
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

  request = () => {
    if (!this.isClosedChannel) {
      this.channel.postMessage({ type: "REQUEST" } satisfies AllDataMessageRequest);
    }
  };

  response = (allData: AllData) => {
    if (!this.isClosedChannel) {
      this.channel.postMessage({ type: "RESPONSE", data: allData } satisfies AllDataMessageResponse);
    }
  };

  close = () => {
    try {
      this.channel.close();
      this.isClosedChannel = true;
    } catch (error) {
      //
    }
  };
}
