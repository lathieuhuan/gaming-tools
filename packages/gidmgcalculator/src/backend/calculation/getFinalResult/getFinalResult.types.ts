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
import type { AppCharacter, AppWeapon, CalcItemBuff, TotalAttribute } from "@Src/backend/types";
import type { CalcInfusion, CharacterStatus } from "../calculation.types";
import type { TrackerControl } from "../controls";
import type { ResistanceReductionControl } from "./controls";

export type DebuffInfoWrap = {
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
  resistReduct: ResistanceReductionControl;
};

export interface GetFinalResultArgs {
  char: CalcCharacter;
  appChar: AppCharacter;
  partyData: PartyData;
  charStatus: CharacterStatus;
  totalAttr: TotalAttribute;
  calcItemBuffs: CalcItemBuff[];

  weapon: CalcWeapon;
  appWeapon: AppWeapon;
  selfDebuffCtrls: ModifierCtrl[];
  artDebuffCtrls: ArtifactDebuffCtrl[];
  party: Party;
  disabledNAs: boolean;
  customDebuffCtrls: CustomDebuffCtrl[];
  infusion: CalcInfusion;
  elmtModCtrls: ElementModCtrl;
  target: Target;
  tracker?: TrackerControl;
}
