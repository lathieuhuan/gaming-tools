import type { Character, PartyData } from "@Src/types";
import type { AppCharacter, AttackElement, NormalAttack } from "../types";

export type CharacterStatus = {
  BOL: number;
};

export type CalcInfusion = {
  element: AttackElement;
  range: NormalAttack[];
  isCustom: boolean;
};

export type CalcUltilInfo = {
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
  charStatus?: CharacterStatus;
};
