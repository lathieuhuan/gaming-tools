import type { AppMetadata } from "../types";

import { MINIMUM_SYSTEM_VERSION } from "@Src/constants";
import { $AppData, Metadata } from "@Src/services";
import { MetadataChannel } from "./MetadataChannel";
import { StoredTime } from "./StoredTime";

type FetchMetadataError = {
  code: number;
  message: string;
  cooldown: number;
};

export class GreeterService {
  private readonly COOLDOWN_NORMAL = 60;
  private readonly COOLDOWN_UPGRADE = 300;
  private isFetchedMetadata = false;

  public metadataInfo: AppMetadata = {
    version: "",
    updates: [],
    supporters: [],
  };

  private metadataChannel = new MetadataChannel();
  private lastVersionCheckTime = new StoredTime("lastVersionCheckTime");

  constructor(private data$: typeof $AppData) {
    this.metadataChannel.onRequest = () => {
      if (this.isFetchedMetadata) {
        this.metadataChannel.response({
          ...this.metadataInfo,
          ...this.data$.data,
        });
      }
    };

    this.metadataChannel.onResponse = (metadata) => {
      if (!this.isFetchedMetadata) {
        this.populateData(metadata);
      }
    };
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

    for (let i = 0; i < 3; i++) {
      const versionFrag = +versionFrags[i];
      const minVersionFrag = +minVersionFrags[i];

      if (versionFrag > minVersionFrag) {
        return true;
      }
      if (versionFrag < minVersionFrag) {
        return false;
      }
    }
    return true;
  }

  private populateData = (data: Metadata) => {
    this.isFetchedMetadata = true;
    this.metadataInfo = {
      version: data.version,
      updates: data.updates,
      supporters: data.supporters,
    };
    this.data$.data = data;
  };

  private async _fetchMetadata(): Promise<FetchMetadataError | null> {
    if (!this.isFetchedMetadata) {
      const response = await this.data$.fetchMetadata();
      const { code, message = "Error.", data } = response;

      if (data) {
        if (this.isValidDataVersion(data.version)) {
          this.populateData(data);
          this.removeVersionCheckTime();
          return null;
        }

        this.lastVersionCheckTime.value = this.currentTime;

        return {
          code: 503,
          message: "The system is being upgraded.",
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

  async fetchMetadata(): Promise<FetchMetadataError | null> {
    const timeElapsed = this.currentTime - this.lastVersionCheckTime.value;

    if (timeElapsed < this.COOLDOWN_UPGRADE) {
      return {
        code: 503,
        message: "The system is being upgraded.",
        cooldown: this.COOLDOWN_UPGRADE - timeElapsed,
      };
    }

    this.metadataChannel.request();

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this._fetchMetadata());
      }, 100);
    });
  }

  endShift = () => {
    this.metadataChannel.close();
  };
}
