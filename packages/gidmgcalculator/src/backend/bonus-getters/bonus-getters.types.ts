import { AttributeStack, EntityBonus } from "@Src/backend/types";
import { CalculationInfo } from "@Src/backend/utils";

type Bonus = EntityBonus<unknown>;

export type GetBonusArgs<T extends Bonus> = {
  config: T;
  info: CalculationInfo;
  inputs: number[];
  fromSelf: boolean;
  getTotalAttrFromSelf: (field: AttributeStack["field"]) => number;
};

export type AppliedBonus = {
  value: number;
  isStable: boolean;
};
