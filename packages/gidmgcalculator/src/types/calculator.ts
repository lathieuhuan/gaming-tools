import type { CalcSetupConstructData } from "@/models";

export type BasicSetupType = "original" | "combined";

export type SetupType = BasicSetupType | "complex";

export type SetupManager = {
  ID: number;
  type: SetupType;
  name: string;
};

export type SetupImportData = {
  /** This ID is prioritized over params.ID */
  ID?: number;
  name?: string;
  type?: BasicSetupType;
  source?: "URL" | "MY_SETUPS" | "ENKA";
  params?: CalcSetupConstructData;
};
