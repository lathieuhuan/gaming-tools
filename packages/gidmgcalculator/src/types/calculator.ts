export type BasicSetupType = "original" | "combined";

export type SetupType = BasicSetupType | "complex";

export type SetupManager = {
  ID: number;
  type: SetupType;
  name: string;
};
