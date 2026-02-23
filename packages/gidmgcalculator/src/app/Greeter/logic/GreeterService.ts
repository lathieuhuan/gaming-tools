import type { AppMetadata } from "../types";

import { MINIMUM_SYSTEM_VERSION } from "@/constants/config";
import { $AppData, AllData } from "@/services";
import { assertIsError } from "@/utils/pure.utils";
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
  private isFetchedMetadata = false;

  metadata: AppMetadata = {
    version: "",
    updates: [],
    supporters: [],
  };

  private allDataChannel: AllDataChannel;
  private lastVersionCheckTime = new TimeStore("lastVersionCheckTime");

  constructor() {
    this.allDataChannel = new AllDataChannel();

    this.allDataChannel.onRequest = () => {
      if (this.isFetchedMetadata) {
        this.allDataChannel.response({
          ...this.metadata,
          ...$AppData.getAll(),
        });
      }
    };

    this.allDataChannel.onResponse = (metadata) => {
      if (!this.isFetchedMetadata) {
        this.populateData(metadata);
      }
    };
  }

  populateData(data: AllData) {
    this.isFetchedMetadata = true;
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

  private removeVersionCheckTime() {
    localStorage.removeItem("lastVersionCheckTime");
  }

  async _fetchAllData(): Promise<FetchAllDataError | null> {
    if (this.isFetchedMetadata) {
      this.removeVersionCheckTime();
      return null;
    }

    const response = await $AppData.fetchAllData();
    const { code, message = "Error.", data } = response;

    if (!data) {
      return {
        code,
        message,
        cooldown: COOLDOWN_NORMAL,
      };
    }

    if (isValidDataVersion(data.version)) {
      this.populateData(data);
      this.removeVersionCheckTime();
      return null;
    }

    // Data is outdated, set cooldown and return error
    this.lastVersionCheckTime.value = this.currentTime;

    return {
      code: 503,
      message: SYSTEM_UPGRADE_MESSAGE,
      cooldown: COOLDOWN_UPGRADE,
    };
  }

  fetchAllData(): Promise<FetchAllDataError | null> {
    const timeElapsed = this.currentTime - this.lastVersionCheckTime.value;

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

    return new Promise((resolve) => {
      setTimeout(() => {
        this._fetchAllData()
          .then(() => resolve(null))
          .catch((error) => {
            assertIsError(error);

            resolve({
              code: 500,
              message: error.message,
              cooldown: COOLDOWN_NORMAL * 5,
            });
          });
      }, 200);
    });
  }

  endShift() {
    this.allDataChannel.close();
  }
}

function isValidDataVersion(version: string) {
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

export const $Greeter = new GreeterService();
