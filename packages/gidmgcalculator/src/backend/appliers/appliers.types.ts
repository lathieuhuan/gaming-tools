import type { CalcCharacter, PartyData } from "@Src/types";
import type { AppCharacter } from "../types";
import type { AttackBonusControl, TotalAttributeControl } from "../controls";

export type BuffInfoWrap = {
  char: CalcCharacter;
  appChar: AppCharacter;
  partyData: PartyData;
  totalAttr: TotalAttributeControl;
  attBonus: AttackBonusControl;
};

export type StackableCheckCondition = {
  trackId?: string;
  paths: string | string[];
};
