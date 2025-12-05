import type {
  ActualAttackElement,
  AttackElement,
  LunarReaction,
  LunarType,
  TransformativeReaction,
} from "../types";

export enum ECalcStatModule {
  /** TotalAttribute */
  ATTR = "ATTR",
  /** ResistReduction */
  RESIST = "RESIST",
}

export const TRANSFORMATIVE_REACTION_CONFIG: Record<
  TransformativeReaction,
  { mult: number; attElmt: ActualAttackElement }
> = {
  bloom: { mult: 2, attElmt: "dendro" },
  hyperbloom: { mult: 3, attElmt: "dendro" },
  burgeon: { mult: 3, attElmt: "dendro" },
  burning: { mult: 0.25, attElmt: "pyro" },
  swirl: { mult: 0.6, attElmt: "absorb" },
  superconduct: { mult: 1.5, attElmt: "cryo" },
  electroCharged: { mult: 2, attElmt: "electro" },
  overloaded: { mult: 2.75, attElmt: "pyro" },
  shattered: { mult: 3, attElmt: "phys" },
};

export const LUNAR_ATTACK_ELEMENT: Record<LunarType, AttackElement> = {
  lunarCharged: "electro",
  lunarBloom: "dendro",
  lunarCryst: "geo",
};

export const LUNAR_REACTION_COEFFICIENT: Record<LunarReaction, number> = {
  lunarCharged: 1.8,
  lunarCryst: 0.96,
};

export const LUNAR_ATTACK_COEFFICIENT: Record<LunarType, number> = {
  lunarCharged: 3,
  lunarBloom: 1,
  lunarCryst: 1.6,
};
