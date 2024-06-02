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
import type { TrackerControl, AttackBonusControl, TotalAttributeControl } from "../../controls";

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
