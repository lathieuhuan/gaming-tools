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
import type { AppCharacter, AppWeapon, AttackElement } from "@Src/backend/types";
import type { CalcItemBuffControl, TrackerControl, BonusControl, TotalAttributeControl } from "../controls";

export type BuffInfoWrap = {
  char: CalcCharacter;
  appChar: AppCharacter;
  partyData?: PartyData;
  totalAttr: TotalAttributeControl;
  bonusCalc: BonusControl;
  calcItemBuff: CalcItemBuffControl;
  infusedElement?: AttackElement;
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
  infusedElement?: AttackElement;
  customInfusion?: Infusion;
  tracker?: TrackerControl;
};
