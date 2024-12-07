import { MINIMUM_SYSTEM_VERSION } from "@Src/constants";
import { $AppData, Metadata, Update } from "@Src/services";
import { MetadataChannel, StoredTime } from "./AppGreetingManager.utils";

type MetadataGeneralInfo = {
  version: string;
  updates: Update[];
  supporters: string[];
};

type FetchMetadataError = {
  code: number;
  message: string;
  cooldown: number;
};

export class GreeterService {
  private readonly COOLDOWN_NORMAL = 30;
  private readonly COOLDOWN_UPGRADE = 15;
  private readonly COOLDOWN_GREETING = 14_400; // 4 hours
  private isFetchedMetadata = false;

  public isFirstInShift: boolean;

  public generalInfo: MetadataGeneralInfo = {
    version: "",
    updates: [],
    supporters: [],
  };

  private metadataChannel = new MetadataChannel();
  private lastVersionCheckTime = new StoredTime("lastVersionCheckTime");
  private lastGreetingTime = new StoredTime("lastGreetingTime");

  constructor(private data$: typeof $AppData) {
    this.metadataChannel.onRequest = () => {
      if (this.isFetchedMetadata) {
        this.metadataChannel.response({
          ...this.generalInfo,
          ...this.data$.data,
        });
      }
    };

    this.metadataChannel.onResponse = (metadata) => {
      if (!this.isFetchedMetadata) {
        this.populateData(metadata);
      }
    };

    const currentTime = this.currentTime;

    this.isFirstInShift = currentTime - this.lastGreetingTime.value > this.COOLDOWN_GREETING;

    if (this.isFirstInShift) {
      this.lastGreetingTime.value = currentTime;
    }
  }

  private get currentTime() {
    return Math.round(Date.now() / 1000);
  }
  private removeVersionCheckTime = () => {
    localStorage.removeItem("lastVersionCheckTime");
  };

  private isValidDataVersion(version: string) {
    const versionFrags = version.split(".");
    const minVersionFrags = MINIMUM_SYSTEM_VERSION.split(".");
    return versionFrags.every((frag, i) => +frag >= +minVersionFrags[i]);
  }

  private populateData = (data: Metadata) => {
    this.isFetchedMetadata = true;
    this.generalInfo = {
      version: data.version,
      updates: data.updates,
      supporters: data.supporters,
    };
    this.data$.data = data;
  };

  private async _fetchMetadata(isRefetch?: boolean): Promise<FetchMetadataError | null> {
    if (!this.isFetchedMetadata || isRefetch) {
      const response = await this.data$.fetchMetadata();
      const { code, message = "Error", data } = response;

      if (data) {
        if (this.isValidDataVersion(data.version)) {
          this.populateData(data);
          this.removeVersionCheckTime();
          return null;
        }

        this.lastVersionCheckTime.value = this.currentTime;

        return {
          code: 503,
          message: "The system is being upgraded",
          cooldown: this.COOLDOWN_UPGRADE,
        };
      }
      return {
        code,
        message,
        cooldown: this.COOLDOWN_NORMAL,
      };
    }

    this.removeVersionCheckTime();
    return null;
  }

  async fetchMetadata(isRefetch?: boolean): Promise<FetchMetadataError | null> {
    const timeElapsed = this.currentTime - this.lastVersionCheckTime.value;

    if (!isRefetch && timeElapsed < this.COOLDOWN_UPGRADE) {
      return {
        code: 503,
        message: "The system is being upgraded",
        cooldown: this.COOLDOWN_UPGRADE - timeElapsed,
      };
    }

    this.metadataChannel.request();

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this._fetchMetadata(isRefetch));
      }, 100);
    });
  }

  endShift = () => {
    this.metadataChannel.close();
  };
}
