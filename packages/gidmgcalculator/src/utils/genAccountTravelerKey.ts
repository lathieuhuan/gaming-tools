import { sha256 } from "js-sha256";

import type { TravelerConfig } from "@/types";

export const genAccountTravelerKey = ({ selection, powerups }: TravelerConfig) => {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(powerups)) {
    if (value) {
      keys.push(key);
    }
  }

  return sha256([selection, ...keys.sort()].toString());
};
