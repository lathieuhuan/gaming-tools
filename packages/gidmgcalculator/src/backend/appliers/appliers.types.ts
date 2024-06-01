import type { CalcCharacter, PartyData } from "@Src/types";
import type { AppCharacter } from "../types";
import type { AttackBonusControl, ResistanceReductionControl, TotalAttributeControl } from "../controls";

export type BuffInfoWrap = {
  char: CalcCharacter;
  appChar: AppCharacter;
  partyData: PartyData;
  totalAttr: TotalAttributeControl;
  attBonus: AttackBonusControl;
};

export type DebuffInfoWrap = {
  char: CalcCharacter;
  appChar: AppCharacter;
  partyData: PartyData;
  resistReduct: ResistanceReductionControl;
};

export type StackableCheckCondition = {
  trackId?: string;
  paths: string | string[];
};
