import type { Level } from "@Src/types";

export const getBareLv = (level: Level): number => +level.split("/")[0];
