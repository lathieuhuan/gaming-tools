import type {
  CalcArtifacts,
  CalcCharacter,
  CalcWeapon,
  CustomBuffCtrl,
  ElementModCtrl,
  ModifierCtrl,
  Party,
  PartyData,
} from "@Src/types";
import type { AppCharacter, AppWeapon, AttackElement, CalcItemBonus } from "@Src/backend/types";
import type { CharacterStatus } from "../calculation.types";
import type { TrackerControl } from "../controls";
import type { BonusControl, TotalAttributeControl } from "./controls";

export type CalcItemBuff = {
  ids: string | string[];
  bonus: CalcItemBonus;
};

export type BuffInfoWrap = {
  char: CalcCharacter;
  appChar: AppCharacter;
  partyData: PartyData;
  charStatus: CharacterStatus;
  totalAttr: TotalAttributeControl;
  bonusCalc: BonusControl;
  calcItemBuffs: CalcItemBuff[];
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
  partyData: PartyData;
  elmtModCtrls?: ElementModCtrl;
  selfBuffCtrls?: ModifierCtrl[];
  wpBuffCtrls?: ModifierCtrl[];
  artBuffCtrls?: ModifierCtrl[];
  customBuffCtrls?: CustomBuffCtrl[];
  infusedElement?: AttackElement;
  tracker?: TrackerControl;
};
