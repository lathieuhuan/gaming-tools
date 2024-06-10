import type { AttackBonusKey, AttackBonusType, AttributeStat } from "@Backend";
import type { Artifact, Character, Weapon } from "./global.types";
import type { Target } from "./calculator.types";

export type SimulationManageInfo = {
  id: number;
  name: string;
};

export type ModifyEvent = {
  character: string;
  modId: number;
  modInputs: number[];
};

export type AttackEvent = {
  character: string;
  duration: number;
};

type SimulationBonus = {
  trigger: {
    character: string;
    src: string;
  };
  value: number;
};

export type SimulationAttributeBonus = SimulationBonus & {
  stable: boolean;
  toStat: AttributeStat;
};

export type SimulationAttackBonus = SimulationBonus & {
  toType: AttackBonusType;
  toKey: AttackBonusKey;
};

export type SimulationMember = Character & {
  weapon: Weapon;
  artifacts: Array<Artifact | null>;
  attributeBonus: SimulationAttributeBonus[];
  attackBonus: SimulationAttackBonus[];
};

export type SimulationTarget = Target;

export type Simulation = {
  members: SimulationMember[];
  modifyEvents: ModifyEvent[];
  attackEvents: AttackEvent[];
  target: SimulationTarget;
};
