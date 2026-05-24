import { sha256 } from "js-sha256";

import type { TravelerConfig } from "@/types";

export const genAccountTravelerKey = (config: TravelerConfig) => {
  const activePowerupKeys: string[] = [];

  for (const [key, value] of Object.entries(config.powerups || {})) {
    if (value) {
      activePowerupKeys.push(key);
    }
  }

  const series = [config.selection, ...activePowerupKeys.sort(), ...config.resonatedElmts.sort()];

  return sha256(series.toString());
};
