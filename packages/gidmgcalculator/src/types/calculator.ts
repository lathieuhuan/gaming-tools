import type { CalcSetupConstructInfo } from "@/models/calculator";

export type BasicSetupType = "original" | "combined";

export type SetupType = BasicSetupType | "complex";

export type ISetupManager = {
  ID: number;
  type: SetupType;
  name: string;
};

export type SetupImportInfo = {
  /** This ID is prioritized over params.ID */
  ID?: number;
  name?: string;
  type?: BasicSetupType;
  source?: "URL" | "SETUP_MANAGER" | "MY_SETUPS" | "ENKA";
  params?: CalcSetupConstructInfo;
};
