import type { ActualAttackElement, LunarReaction, TransformativeReaction } from "../types";

export enum ECalcStatModule {
  /** TotalAttribute */
  ATTR = "ATTR",
  /** ResistanceReduction */
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

export const LUNAR_REACTION_CONFIG: Record<LunarReaction, { mult: number; attElmt: ActualAttackElement }> = {
  lunarCharged: { mult: 1.66, attElmt: "electro" },
};
