export * from "./app-artifact";
export * from "./app-character";
export * from "./app-entity";
export * from "./app-monster";
export * from "./app-team-buff";
export * from "./app-weapon";
export * from "./calculator";
export * from "./calculation";
export * from "./common";
export * from "./entity";
export * from "./global.types";
export * from "./user-entity";

// TODO: move
export type SetupImportInfo = {
  importSource?: "URL" | "SETUP_MANAGER" | "MY_SETUPS" | "ENKA";
  ID?: number;
  name?: string;
  type?: "original" | "combined";
  // calcSetup?: CalcSetup;
  // target?: Target;
};
