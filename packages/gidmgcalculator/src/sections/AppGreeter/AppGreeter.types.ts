import type { Update } from "@Src/services";

export type MetadataInfo = {
  version: string;
  updates: Update[];
  supporters: string[];
};
