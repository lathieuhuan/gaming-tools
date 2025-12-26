import type { DatabaseDataV3 } from "./types/v3";
import type { DatabaseDataV3_1 } from "./types/v3_1";

export const convertToV3_1 = (data: DatabaseDataV3): DatabaseDataV3_1 => {
  return {
    ...data,
    version: 3.1,
    setups: [],
  };
};
