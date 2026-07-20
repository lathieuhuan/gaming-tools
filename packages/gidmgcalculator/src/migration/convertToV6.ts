import type { DatabaseDataV5 } from "./types/v5";
import type { DatabaseDataV6 } from "./types/v6";

export function convertToV6(data: DatabaseDataV5): DatabaseDataV6 {
  return {
    ...data,
    version: 6,
    setups: data.setups.map((setup) => {
      if (setup.type === "complex") {
        return setup;
      }

      return {
        ...setup,
        elmtEvent: {
          ...setup.elmtEvent,
          polestarProc: false,
          polestarCount: 0,
        },
      };
    }),
  };
}
