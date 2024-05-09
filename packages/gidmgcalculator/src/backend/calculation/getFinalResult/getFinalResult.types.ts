import type { CalcCharacter, CalcWeapon, PartyData } from "@Src/types";
import type { AppCharacter, AppWeapon, ResistanceReduction } from "@Src/backend/types";
import type { TotalAttribute } from "../calculation.types";
import type { TrackerControl, CalcItemBuffControl, BonusControl } from "../controls";
import type { ConfigAttackPattern } from "../attack-pattern-conf";
import type { CalculateCalcItem } from "../calc-item-calculator";

export interface GetFinalResultArgs {
  char: CalcCharacter;
  appChar: AppCharacter;
  partyData: PartyData;
  weapon: CalcWeapon;
  appWeapon: AppWeapon;
  totalAttr: TotalAttribute;
  bonusCtrl: BonusControl;
  calcItemBuff: CalcItemBuffControl;
  resistances: ResistanceReduction;
  tracker?: TrackerControl;
  configAttackPattern: ConfigAttackPattern;
  calculateCalcItem: CalculateCalcItem;
}
