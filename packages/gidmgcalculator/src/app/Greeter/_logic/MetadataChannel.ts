import type { AllData } from "@/services";

type MetadataMessageRequest = {
  type: "REQUEST";
};

type MetadataMessageResponse = {
  type: "RESPONSE";
  data: AllData;
};

export class MetadataChannel {
  private channel = new BroadcastChannel("METADATA");
  private isClosedChannel = false;

  onRequest = () => {};

  onResponse = (data: AllData) => {};

  constructor() {
    this.channel.onmessage = ({ data }: MessageEvent<MetadataMessageRequest | MetadataMessageResponse>) => {
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
      this.channel.postMessage({ type: "REQUEST" } satisfies MetadataMessageRequest);
    }
  };

  response = (metadata: AllData) => {
    if (!this.isClosedChannel) {
      this.channel.postMessage({ type: "RESPONSE", data: metadata } satisfies MetadataMessageResponse);
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
