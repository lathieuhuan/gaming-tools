import type { Update } from "@Src/services";

export type AppMetadata = {
  version: string;
  updates: Update[];
  supporters: string[];
};
