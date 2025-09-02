import { sha256 } from "js-sha256";

import type { TravelerInfo } from "@/types";
import type { RootState } from "@Store/store";

export const genAccountTravelerKey = ({ selection, powerups }: TravelerInfo) => {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(powerups)) {
    if (value) {
      keys.push(key);
    }
  }

  return sha256([selection, ...keys.sort()].toString());
};

export const selectTraveler = (state: RootState) => state.account.traveler;