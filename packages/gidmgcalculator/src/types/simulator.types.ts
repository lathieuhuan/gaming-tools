import type { Artifact, Character, Weapon } from "./global.types";
import type { Target } from "./calculator.types";
import { AttackBonusKey, AttackBonusType, AttributeStat } from "@Src/backend/types";

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

export type SimulationMember = {
  name: string;
  info: Character & {
    weapon: Weapon;
    artifacts: Array<Artifact | null>;
  };
  bonus: {
    attributeBonus: SimulationAttributeBonus[];
    attackBonus: SimulationAttackBonus[];
  };
};

export type SimulationTarget = Target;

export type Simulation = {
  members: SimulationMember[];
  modifyEvents: ModifyEvent[];
  attackEvents: AttackEvent[];
  target: SimulationTarget;
};
