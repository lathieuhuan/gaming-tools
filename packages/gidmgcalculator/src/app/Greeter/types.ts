import type { Update } from "@/services";

export type AppMetadata = {
  version: string;
  updates: Update[];
  supporters: string[];
};
