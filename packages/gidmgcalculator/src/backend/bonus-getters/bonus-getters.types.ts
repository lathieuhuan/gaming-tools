import type { AttributeStack, EntityBonus } from "@Src/backend/types";
import type { CalculationInfo } from "@Src/backend/utils";

export type GetBonusArgs<T extends EntityBonus> = {
  config: T;
  info: CalculationInfo;
  inputs: number[];
  fromSelf: boolean;
  getTotalAttrFromSelf: (field: AttributeStack["field"]) => number;
};

export type AppliedBonus = {
  id: string;
  value: number;
  isStable: boolean;
};
