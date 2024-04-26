import type {
  ArtifactDebuffCtrl,
  CalcWeapon,
  Character,
  CustomDebuffCtrl,
  ElementModCtrl,
  ModifierCtrl,
  Party,
  PartyData,
  Target,
} from "@Src/types";
import type { AppCharacter, AppWeapon } from "@Src/backend/types";
import type { TrackerControl } from "../controls";
import type { ResistanceReductionControl } from "./controls";
import type { BuffInfoWrap } from "../getCalculationStats";

export type DebuffInfoWrap = {
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
  resistReduct: ResistanceReductionControl;
};

export interface GetFinalResultArgs extends Omit<BuffInfoWrap, "infusedElement"> {
  weapon: CalcWeapon;
  appWeapon: AppWeapon;
  selfDebuffCtrls: ModifierCtrl[];
  artDebuffCtrls: ArtifactDebuffCtrl[];
  party: Party;
  disabledNAs: boolean;
  customDebuffCtrls: CustomDebuffCtrl[];
  //   infusion: CalcInfusion;
  elmtModCtrls: ElementModCtrl;
  target: Target;
  tracker?: TrackerControl;
}
