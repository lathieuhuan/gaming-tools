import type { EntityBonusCore, EntityBonusBasedOnField } from "../types";
import type { CalculationInfo } from "../utils";

export type GetBonusArgs<T extends EntityBonusCore> = {
  config: T;
  info: CalculationInfo;
  inputs: number[];
  fromSelf: boolean;
  getTotalAttrFromSelf: (field: EntityBonusBasedOnField) => number;
};

export type BareBonus = {
  id: string;
  value: number;
  isStable: boolean;
};
