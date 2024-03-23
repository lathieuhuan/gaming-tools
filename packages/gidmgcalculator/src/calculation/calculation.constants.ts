import type { ActualAttackElement, AttributeStat, TransformativeReaction } from "@Src/types";

type ResonanceStat = {
  key: AttributeStat;
  value: number;
};

export const RESONANCE_STAT: Record<string, ResonanceStat> = {
  pyro: { key: "atk_", value: 25 },
  cryo: { key: "cRate_", value: 15 },
  geo: { key: "shieldS_", value: 15 },
  hydro: { key: "hp_", value: 25 },
  dendro: { key: "em", value: 50 },
};

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
