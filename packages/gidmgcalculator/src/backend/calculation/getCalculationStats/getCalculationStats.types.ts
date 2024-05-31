import type {
  CalcArtifacts,
  CalcCharacter,
  CalcWeapon,
  CustomBuffCtrl,
  ElementModCtrl,
  Infusion,
  ModifierCtrl,
  Party,
  PartyData,
} from "@Src/types";
import type { AppCharacter, AppWeapon } from "@Src/backend/types";
import type { TrackerControl } from "@Src/backend/controls";

export type GetCalculationStatsArgs = {
  char: CalcCharacter;
  appChar: AppCharacter;
  weapon: CalcWeapon;
  appWeapon: AppWeapon;
  artifacts: CalcArtifacts;
  party?: Party;
  partyData?: PartyData;
  elmtModCtrls?: ElementModCtrl;
  selfBuffCtrls?: ModifierCtrl[];
  wpBuffCtrls?: ModifierCtrl[];
  artBuffCtrls?: ModifierCtrl[];
  customBuffCtrls?: CustomBuffCtrl[];
  customInfusion?: Infusion;
  tracker?: TrackerControl;
};
