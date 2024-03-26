import type { Artifact, Character, TotalAttributeStat, Weapon } from "./global.types";
import type {
  ArtifactDebuffCtrl,
  AttackElementPath,
  AttackPatternPath,
  CalcItemBonus,
  CalcItemType,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementModCtrl,
  Infusion,
  ModifierCtrl,
  Party,
  ReactionBonusPath,
  ResistanceReductionKey,
  Target,
} from "./calculation-core.types";

export type CalcWeapon = Weapon;

export type CalcArtifact = Artifact;
export type CalcArtifacts = (CalcArtifact | null)[];

export type CalcCharacter = Character;

export type SetupType = "original" | "combined" | "complex";

export type CalcSetupManageInfo = {
  ID: number;
  type: SetupType;
  name: string;
};

export type CalcSetup = {
  char: CalcCharacter;
  selfBuffCtrls: ModifierCtrl[];
  selfDebuffCtrls: ModifierCtrl[];

  weapon: CalcWeapon;
  wpBuffCtrls: ModifierCtrl[];
  artifacts: CalcArtifacts;
  artBuffCtrls: ModifierCtrl[];
  artDebuffCtrls: ArtifactDebuffCtrl[];

  party: Party;
  elmtModCtrls: ElementModCtrl;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  customInfusion: Infusion;
};

export type SetupImportInfo = {
  importRoute?: "URL" | "SETUP_MANAGER";
  ID?: number;
  name?: string;
  type?: "original" | "combined";
  calcSetup?: CalcSetup;
  target?: Target;
};

// Tracker

export type TrackerRecord = {
  desc: string;
  value: number;
};

export type TrackerCalcItemRecord = {
  itemType: CalcItemType;
  multFactors: Array<{
    desc?: string;
    value: number;
    talentMult?: number;
  }>;
  totalFlat?: number;
  normalMult: number;
  specialMult?: number;
  rxnMult?: number;
  defMult?: number;
  resMult?: number;
  cRate_?: number;
  cDmg_?: number;
  note?: string;
  exclusives?: CalcItemBonus[];
};

export type TrackerState = "open" | "close" | "hidden";

type TrackedCalcItem = Record<string, TrackerCalcItemRecord>;

export type Tracker = {
  totalAttr: Record<TotalAttributeStat, TrackerRecord[]>;
  attPattBonus: Record<AttackPatternPath, TrackerRecord[]>;
  attElmtBonus: Record<AttackElementPath, TrackerRecord[]>;
  rxnBonus: Record<ReactionBonusPath, TrackerRecord[]>;
  resistReduct: Record<ResistanceReductionKey, TrackerRecord[]>;
  NAs: TrackedCalcItem;
  ES: TrackedCalcItem;
  EB: TrackedCalcItem;
  RXN: TrackedCalcItem;
  WP_CALC: TrackedCalcItem;
};
