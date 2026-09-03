import type { Update } from "@/services";

export type AppGeneralData = {
  version: string;
  updates: Update[];
  supporters: string[];
};
