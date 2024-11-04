import type { ActualAttackElement, TransformativeReaction } from "../types";

export enum ECalcStatModule {
  /** TotalAttribute */
  ATTR = "ATTR",
  /** ResistanceReduction */
  RESIST = "RESIST",
}

export const TRANSFORMATIVE_REACTION_INFO: Record<
  TransformativeReaction,
  { mult: number; dmgType: ActualAttackElement }
> = {
  bloom: { mult: 2, dmgType: "dendro" },
  hyperbloom: { mult: 3, dmgType: "dendro" },
  burgeon: { mult: 3, dmgType: "dendro" },
  burning: { mult: 0.25, dmgType: "pyro" },
  swirl: { mult: 0.6, dmgType: "absorb" },
  superconduct: { mult: 0.5, dmgType: "cryo" },
  electroCharged: { mult: 1.2, dmgType: "electro" },
  overloaded: { mult: 2, dmgType: "pyro" },
  shattered: { mult: 1.5, dmgType: "phys" },
};
