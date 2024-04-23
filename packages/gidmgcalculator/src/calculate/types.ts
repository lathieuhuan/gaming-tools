import type {
  AppCharacter,
  AppWeapon,
  AttackElement,
  CalcArtifacts,
  CalcCharacter,
  CalcItemBuff,
  CalcWeapon,
  CharacterStatus,
  CustomBuffCtrl,
  ElementModCtrl,
  ModifierCtrl,
  Party,
  PartyData,
} from "@Src/types";
import { BonusCalc, TotalAttributeCalc, TrackerCalc } from "./utils";

export type CalcUltilInfo = {
  char: CalcCharacter;
  appChar: AppCharacter;
  partyData: PartyData;
  charStatus?: CharacterStatus;
};

export type BuffInfoWrap = {
  char: CalcCharacter;
  appChar: AppCharacter;
  partyData: PartyData;
  charStatus: CharacterStatus;
  totalAttr: TotalAttributeCalc;
  bonusCalc: BonusCalc;
  calcItemBuffs: CalcItemBuff[];
  infusedElement?: AttackElement;
  // tracker?: TrackerCalc;
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
  tracker?: TrackerCalc;
};

export type StackableCheckCondition = {
  trackId?: string;
  targets: string | string[];
};
