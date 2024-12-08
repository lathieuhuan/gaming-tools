import type { Metadata } from "@Src/services";

type MetadataMessageRequest = {
  type: "REQUEST";
};

type MetadataMessageResponse = {
  type: "RESPONSE";
  data: Metadata;
};

export class MetadataChannel {
  private channel = new BroadcastChannel("METADATA");

  onRequest = () => {};

  onResponse = (data: Metadata) => {};

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
    this.channel.postMessage({ type: "REQUEST" } satisfies MetadataMessageRequest);
  };

  response = (metadata: Metadata) => {
    this.channel.postMessage({ type: "RESPONSE", data: metadata } satisfies MetadataMessageResponse);
  };

  close = () => {
    try {
      this.channel.close();
    } catch (error) {
      //
    }
  };
}
