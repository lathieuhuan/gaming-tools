import type {
  AttackElement,
  AttackPattern,
  AttackReaction,
  AttributeStat,
  ElementType,
  NormalAttack,
  Reaction,
  TotalAttributeStat,
  WeaponType,
} from "./global.types";
import type { ActualAttackElement } from "./app-character.type";
import { ATTACK_ELEMENT_INFO_KEYS, ATTACK_PATTERN_INFO_KEYS, REACTION_BONUS_INFO_KEYS } from "@Src/constants";

export type ArtifactSetBonus = {
  code: number;
  bonusLv: number;
};

export type TotalAttribute = Record<TotalAttributeStat, number>;

export type AttackPatternInfoKey = (typeof ATTACK_PATTERN_INFO_KEYS)[number];
export type AttackPatternInfo = Record<AttackPatternInfoKey, number>;
export type AttackPatternBonusKey = AttackPattern | "all";
export type AttackPatternBonus = Record<AttackPatternBonusKey, AttackPatternInfo>;
export type AttackPatternPath = `${AttackPatternBonusKey}.${AttackPatternInfoKey}`;

export type ResistanceReductionKey = AttackElement | "def";

export type AttackElementInfoKey = (typeof ATTACK_ELEMENT_INFO_KEYS)[number];
export type AttackElementPath = `${AttackElement}.${AttackElementInfoKey}`;

export type ReactionBonusInfoKey = (typeof REACTION_BONUS_INFO_KEYS)[number];
export type ReactionBonusInfo = Record<ReactionBonusInfoKey, number>;
export type ReactionBonusPath = `${Reaction}.${ReactionBonusInfoKey}`;
export type ReactionBonus = Record<Reaction, ReactionBonusInfo>;

export type Target = {
  code: number;
  level: number;
  variantType?: ElementType;
  inputs?: number[];
  resistances: Record<AttackElement, number>;
};

// MODIFIER CONTROL starts
export type ModifierCtrl = {
  activated: boolean;
  /** This is WeaponBuff.index / ArtifactBuff.index / Modifier_Character.index */
  index: number;
  inputs?: number[];
};

export type ArtifactDebuffCtrl = ModifierCtrl & {
  code: number;
};

export type Resonance = {
  vision: ElementType;
  activated: boolean;
  inputs?: number[];
};
export type ElementModCtrl = {
  infuse_reaction: AttackReaction;
  reaction: AttackReaction;
  absorption: ElementType | null;
  superconduct: boolean;
  resonances: Resonance[];
};

export type CustomBuffCtrlType = AttributeStat | AttackPatternBonusKey | Reaction;

export type CustomBuffCtrl = {
  category: "totalAttr" | "attPattBonus" | "attElmtBonus" | "rxnBonus";
  type: CustomBuffCtrlType;
  subType?: AttackPatternInfoKey | AttackElementInfoKey | ReactionBonusInfoKey;
  value: number;
};

export type CustomDebuffCtrlType = ResistanceReductionKey;

export type CustomDebuffCtrl = {
  type: CustomDebuffCtrlType;
  value: number;
};
// MODIFIER CONTROL ends

export type Infusion = {
  element: AttackElement;
  range?: NormalAttack[];
};

// PARTY starts
export type TeammateWeapon = {
  code: number;
  type: WeaponType;
  refi: number;
  buffCtrls: ModifierCtrl[];
};

export type TeammateArtifact = {
  code: number;
  buffCtrls: ModifierCtrl[];
};

export type Teammate = {
  name: string;
  buffCtrls: ModifierCtrl[];
  debuffCtrls: ModifierCtrl[];
  weapon: TeammateWeapon;
  artifact: TeammateArtifact;
};

export type Party = (Teammate | null)[];
// PARTY ends

export type CalculationAspect = "nonCrit" | "crit" | "average";

type CalculationFinalResultItem = Record<CalculationAspect, number | number[]> & {
  attElmt?: ActualAttackElement;
};

export type CalculationFinalResultGroup = Record<string, CalculationFinalResultItem>;

export type CalculationFinalResult = Record<"NAs" | "ES" | "EB" | "RXN", CalculationFinalResultGroup>;
