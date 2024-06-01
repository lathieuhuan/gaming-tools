import type { Level } from "@Backend";
import type { CalcArtifact, CalcWeapon, ElementModCtrl, ModifierCtrl } from "./calculator.types";

export type SimulationManageInfo = {
  id: number;
  name: string;
};

type SimulationMember = {
  name: string;
  level: Level;
  cons: number;
  NAs: number;
  ES: number;
  EB: number;
  weapon: CalcWeapon;
  artifacts: Array<CalcArtifact | null>;
  elmtModCtrls: ElementModCtrl;
  buffCtrls: ModifierCtrl[];
};

export type Simulation = {
  actions: unknown[];
  members: SimulationMember[];
};
