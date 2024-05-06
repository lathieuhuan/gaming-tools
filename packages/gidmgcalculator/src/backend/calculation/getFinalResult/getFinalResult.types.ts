import type {
  ArtifactDebuffCtrl,
  CalcCharacter,
  CalcWeapon,
  Character,
  CustomDebuffCtrl,
  ElementModCtrl,
  ModifierCtrl,
  Party,
  PartyData,
  Target,
} from "@Src/types";
import type {
  AppCharacter,
  AppWeapon,
  AttackElementBonus,
  AttackPatternBonus,
  ReactionBonus,
} from "@Src/backend/types";
import type { CalcInfusion, TotalAttribute } from "../calculation.types";
import type {
  TrackerControl,
  ResistanceReductionControl,
  CalcItemBuffControl,
  CalcListConfigControl,
} from "../controls";

export type DebuffInfoWrap = {
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
  resistReduct: ResistanceReductionControl;
};

export interface GetFinalResultArgs {
  char: CalcCharacter;
  appChar: AppCharacter;
  party: Party;
  partyData: PartyData;
  weapon: CalcWeapon;
  appWeapon: AppWeapon;
  selfDebuffCtrls: ModifierCtrl[];
  artDebuffCtrls: ArtifactDebuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  elmtModCtrls: ElementModCtrl;
  attElmtBonus: AttackElementBonus;
  totalAttr: TotalAttribute;
  attPattBonus: AttackPatternBonus;
  target: Target;
  rxnBonus: ReactionBonus;
  calcItemBuff: CalcItemBuffControl;
  disabledNAs: boolean;
  infusion: CalcInfusion;
  calcListConfig: CalcListConfigControl;
  tracker?: TrackerControl;
}
