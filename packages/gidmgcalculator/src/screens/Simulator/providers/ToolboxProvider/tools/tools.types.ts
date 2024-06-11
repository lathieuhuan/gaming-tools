import { AttackBonusKey, AttackBonusType, AttributeStat } from "@Backend";

type SimulationBonus = {
  trigger: {
    character: string;
    modifier: string;
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
