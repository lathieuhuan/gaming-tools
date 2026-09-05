import type { AppData } from "./types";

import { MINIMUM_SYSTEM_VERSION } from "@/constants/config";
import { ServiceError } from "../ServiceError";
import { getAppData } from "./getAppData";
import { getCachedAppData } from "./selector";
import { AppDataChannel } from "./utils/AppDataChannel";
import { TimeStore } from "./utils/TimeStore";

const COOLDOWN_UPGRADE = 300;
const SYSTEM_UPGRADE_MESSAGE = "The system is being upgraded.";

export type AppGeneralData = Pick<AppData, "version" | "updates" | "supporters">;

const dataChannel = new AppDataChannel();
const lastVersionCheckTime = new TimeStore("lastVersionCheckTime");

dataChannel.onRequest = () => {
  const appData = getCachedAppData();

  if (appData !== undefined) {
    dataChannel.response(appData);
  }
};

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

function currentTime() {
  return Math.round(Date.now() / 1000);
}

export async function getSharedAppData(): Promise<AppData> {
  const timeElapsed = currentTime() - lastVersionCheckTime.get();

  if (timeElapsed < COOLDOWN_UPGRADE) {
    // Still in cooldown of refetching data
    const details = { cooldown: COOLDOWN_UPGRADE - timeElapsed };

    throw new ServiceError(503, SYSTEM_UPGRADE_MESSAGE, details);
  }

  // Request data from other tabs
  const sharedData = await dataChannel.request();

  if (sharedData !== null) {
    return sharedData;
  }

  const { data } = await getAppData();

  if (data !== null && isValidDataVersion(data.version)) {
    lastVersionCheckTime.remove();

    return data;
  }

  // Data is outdated, set cooldown and return error
  lastVersionCheckTime.set(currentTime());

  throw new ServiceError(503, SYSTEM_UPGRADE_MESSAGE, { cooldown: COOLDOWN_UPGRADE });
}
