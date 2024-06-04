import type { Artifact, Character, Weapon } from "./global.types";
import type { Target } from "./calculator.types";
import { AttackBonusKey, AttackBonusType, AttributeStat } from "@Src/backend/types";

export type SimulationManageInfo = {
  id: number;
  name: string;
};

type ModifyEvent = {
  character: string;
  modId: number;
  modInputs: number[];
};

type AttackEvent = {
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
  to: AttributeStat;
};

export type SimulationAttackBonus = SimulationBonus & {
  to: {
    type: AttackBonusType;
    key: AttackBonusKey;
  };
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
