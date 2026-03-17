import { assertIsError, delay } from "ron-utils";

import type { AppMetadata } from "../types";

import { MINIMUM_SYSTEM_VERSION } from "@/constants/config";
import { $AppData, AllData } from "@/services";
import { AllDataChannel } from "./AllDataChannel";
import { TimeStore } from "./TimeStore";

const COOLDOWN_NORMAL = 60;
const COOLDOWN_UPGRADE = 300;
const SYSTEM_UPGRADE_MESSAGE = "The system is being upgraded.";

type FetchAllDataError = {
  code: number;
  message: string;
  cooldown: number;
};

class GreeterService {
  private allDataChannel: AllDataChannel;
  private lastVersionCheckTime = new TimeStore("lastVersionCheckTime");
  private isFetchedAllData = false;

  metadata: AppMetadata = {
    version: "",
    updates: [],
    supporters: [],
  };

  constructor() {
    this.allDataChannel = new AllDataChannel();

    this.allDataChannel.onRequest = () => {
      if (this.isFetchedAllData) {
        this.allDataChannel.response({
          ...this.metadata,
          ...$AppData.getAll(),
        });
      }
    };

    this.allDataChannel.onResponse = (metadata) => {
      if (!this.isFetchedAllData && this.isValidDataVersion(metadata.version)) {
        this.populateData(metadata);
      }
    };
  }

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

  populateData(data: AllData) {
    this.isFetchedAllData = true;
    this.metadata = {
      version: data.version,
      updates: data.updates,
      supporters: data.supporters,
    };

    $AppData.populate(data);
  }

  private get currentTime() {
    return Math.round(Date.now() / 1000);
  }

  private async fetchAllData(): Promise<FetchAllDataError | null> {
    const response = await $AppData.fetchAllData();
    const { code, message = "Error.", data } = response;

    if (!data) {
      return {
        code,
        message,
        cooldown: COOLDOWN_NORMAL,
      };
    }

    if (this.isValidDataVersion(data.version)) {
      this.populateData(data);
      this.lastVersionCheckTime.remove();
      return null;
    }

    // Data is outdated, set cooldown and return error
    this.lastVersionCheckTime.set(this.currentTime);

    return {
      code: 503,
      message: SYSTEM_UPGRADE_MESSAGE,
      cooldown: COOLDOWN_UPGRADE,
    };
  }

  async getAllData(): Promise<FetchAllDataError | null> {
    const timeElapsed = this.currentTime - this.lastVersionCheckTime.get();

    if (timeElapsed < COOLDOWN_UPGRADE) {
      // Still in cooldown of refetching data
      return Promise.resolve({
        code: 503,
        message: SYSTEM_UPGRADE_MESSAGE,
        cooldown: COOLDOWN_UPGRADE - timeElapsed,
      });
    }

    // Request data from other tabs
    this.allDataChannel.request();

    // Give it time to receive the data from other tabs
    await delay(200);

    if (this.isFetchedAllData) {
      this.lastVersionCheckTime.remove();
      return null;
    }

    return this.fetchAllData()
      .then((error) => error)
      .catch((error) => {
        assertIsError(error);

        return {
          code: 500,
          message: error.message,
          cooldown: COOLDOWN_NORMAL * 5,
        };
      });
  }

  endShift() {
    this.allDataChannel.close();
  }
}

export const $Greeter = new GreeterService();
