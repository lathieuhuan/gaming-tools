import type { AppMetadata } from "../types";

import { MINIMUM_SYSTEM_VERSION } from "@/constants/config";
import { $AppData, AllData } from "@/services";
import { AllDataChannel } from "./AllDataChannel";
import { StoredTime } from "./StoredTime";

const COOLDOWN_NORMAL = 60;
const COOLDOWN_UPGRADE = 300;
const SYSTEM_UPGRADE_MESSAGE = "The system is being upgraded.";
let isFetchedMetadata = false;

let metadata: AppMetadata = {
  version: "",
  updates: [],
  supporters: [],
};

const allDataChannel = new AllDataChannel();
const lastVersionCheckTime = new StoredTime("lastVersionCheckTime");

allDataChannel.onRequest = () => {
  if (isFetchedMetadata) {
    allDataChannel.response({
      ...metadata,
      ...$AppData.getAll(),
    });
  }
};

allDataChannel.onResponse = (metadata) => {
  if (!isFetchedMetadata) {
    populateData(metadata);
  }
};

function getCurrentTime() {
  return Math.round(Date.now() / 1000);
}
function removeVersionCheckTime() {
  localStorage.removeItem("lastVersionCheckTime");
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

function populateData(data: AllData) {
  isFetchedMetadata = true;
  metadata = {
    version: data.version,
    updates: data.updates,
    supporters: data.supporters,
  };
  $AppData.populate(data);
}

type FetchAllDataError = {
  code: number;
  message: string;
  cooldown: number;
};

async function _fetchAllData(): Promise<FetchAllDataError | null> {
  if (!isFetchedMetadata) {
    const response = await $AppData.fetchAllData();
    const { code, message = "Error.", data } = response;

    if (data) {
      if (isValidDataVersion(data.version)) {
        populateData(data);
        removeVersionCheckTime();
        return null;
      }

      // Data is outdated, set cooldown and return error
      lastVersionCheckTime.value = getCurrentTime();

      return {
        code: 503,
        message: SYSTEM_UPGRADE_MESSAGE,
        cooldown: COOLDOWN_UPGRADE,
      };
    }

    return {
      code,
      message,
      cooldown: COOLDOWN_NORMAL,
    };
  }

  removeVersionCheckTime();
  return null;
}

async function fetchAllData(): Promise<FetchAllDataError | null> {
  const timeElapsed = getCurrentTime() - lastVersionCheckTime.value;

  if (timeElapsed < COOLDOWN_UPGRADE) {
    // Still in cooldown of refetching data
    return {
      code: 503,
      message: SYSTEM_UPGRADE_MESSAGE,
      cooldown: COOLDOWN_UPGRADE - timeElapsed,
    };
  }

  // Request data from other tabs
  allDataChannel.request();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(_fetchAllData());
    }, 200);
  });
}

function endShift() {
  allDataChannel.close();
}

export const $Greeter = {
  metadata,
  fetchAllData,
  endShift,
};
