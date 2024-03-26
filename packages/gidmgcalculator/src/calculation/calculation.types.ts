import type {
  ActualAttackPattern,
  AppCharacter,
  AppWeapon,
  ArtifactDebuffCtrl,
  AttackElement,
  BuffInfoWrap,
  CalcArtifacts,
  CalcItem,
  CalcItemBonus,
  CalcWeapon,
  Character,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementModCtrl,
  ElementType,
  ModifierCtrl,
  NormalAttack,
  Party,
  PartyData,
  ResistanceReduction,
  Target,
  Tracker,
  TrackerCalcItemRecord,
} from "@Src/types";

export type StackableCheckCondition = {
  trackId?: string;
  targets: string | string[];
};

export type CalcUltilInfo = {
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
};

export type GetCalculationStatsArgs = {
  char: Character;
  appChar: AppCharacter;
  weapon: CalcWeapon;
  appWeapon: AppWeapon;
  artifacts: CalcArtifacts;

  selfBuffCtrls?: ModifierCtrl[];
  wpBuffCtrls?: ModifierCtrl[];
  artBuffCtrls?: ModifierCtrl[];
  elmtModCtrls?: ElementModCtrl;
  party?: Party;
  partyData?: PartyData;
  customBuffCtrls?: CustomBuffCtrl[];
  infusedElement?: AttackElement;
  tracker?: Tracker;
};

export interface CalculateItemArgs extends Pick<BuffInfoWrap, "char" | "totalAttr" | "attElmtBonus" | "attPattBonus"> {
  stat: CalcItem;
  attPatt: ActualAttackPattern;
  attElmt: AttackElement;
  base: number | number[];
  target: Target;
  rxnMult: number;
  calcItemBonues: CalcItemBonus[];
  absorbedElmt?: ElementType;
  resistReduct: ResistanceReduction;
  record: TrackerCalcItemRecord;
}

export interface GetFinalResultArgs extends Omit<BuffInfoWrap, "infusedElement"> {
  appWeapon: AppWeapon;
  selfDebuffCtrls: ModifierCtrl[];
  artDebuffCtrls: ArtifactDebuffCtrl[];
  party: Party;
  disabledNAs: boolean;
  customDebuffCtrls: CustomDebuffCtrl[];
  infusion: {
    element: AttackElement;
    range: NormalAttack[];
    isCustom: boolean;
  };
  elmtModCtrls: ElementModCtrl;
  target: Target;
  tracker?: Tracker;
}
