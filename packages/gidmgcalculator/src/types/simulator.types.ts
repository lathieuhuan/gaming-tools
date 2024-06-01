import type { Level } from "@Backend";
import type { CalcArtifact, CalcWeapon, ElementModCtrl, Infusion, ModifierCtrl, Target } from "./calculator.types";

export type SimulationManageInfo = {
  id: number;
  name: string;
};

export type SimulationMember = {
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
  customInfusion: Infusion;
};

export type SimulationTarget = Target;

export type Simulation = {
  actions: unknown[];
  members: SimulationMember[];
  target: SimulationTarget;
};
