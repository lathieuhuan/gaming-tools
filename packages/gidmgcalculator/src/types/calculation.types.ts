import { ATTACK_ELEMENT_INFO_KEYS, ATTACK_PATTERN_INFO_KEYS, REACTION_BONUS_INFO_KEYS } from "@Src/constants";
import type { AttackElement, AttackPattern, Reaction } from "./global.types";

export type AttackPatternInfoKey = (typeof ATTACK_PATTERN_INFO_KEYS)[number];
export type AttackPatternInfo = Record<AttackPatternInfoKey, number>;
export type AttackPatternBonusKey = AttackPattern | "all";
export type AttackPatternBonus = Record<AttackPatternBonusKey, AttackPatternInfo>;
export type AttackPatternPath = `${AttackPatternBonusKey}.${AttackPatternInfoKey}`;

export type ResistanceReductionKey = AttackElement | "def";

export type AttackElementInfoKey = (typeof ATTACK_ELEMENT_INFO_KEYS)[number];
export type AttackElementPath = `${AttackElement}.${AttackElementInfoKey}`;

export type ReactionBonusInfoKey = (typeof REACTION_BONUS_INFO_KEYS)[number];
export type ReactionBonusPath = `${Reaction}.${ReactionBonusInfoKey}`;
