import type {
  ArtifactDebuffCtrl,
  Character,
  CustomDebuffCtrl,
  ElementModCtrl,
  ModifierCtrl,
  Party,
  PartyData,
  Target,
} from "@Src/types";
import type { AppCharacter } from "@Src/backend/types";
import type { ResistanceReductionControl, TrackerControl } from "@Src/backend/controls";

export type DebuffInfoWrap = {
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
  resistReduct: ResistanceReductionControl;
};

export type GetResistancesArgs = {
  char: Character;
  appChar: AppCharacter;
  party: Party;
  partyData: PartyData;
  customDebuffCtrls: CustomDebuffCtrl[];
  selfDebuffCtrls: ModifierCtrl[];
  artDebuffCtrls: ArtifactDebuffCtrl[];
  elmtModCtrls: ElementModCtrl;
  target: Target;
  tracker?: TrackerControl;
};
