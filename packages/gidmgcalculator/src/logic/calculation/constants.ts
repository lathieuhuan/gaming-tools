import {
  ActualAttackElement,
  LunarReaction,
  NatureLunarReaction,
  TransformativeReaction,
} from "@/types/common";
import type { CalcOtherOutputs } from "./types";

export const DEFAULT_CALC_OTHER_OUTPUTS: CalcOtherOutputs = {
  type: "other",
  bonusId: undefined,
  baseMult: 1,
  flat: 0,
  bonusMult: 1,
  inHealMult: 1,
  result: 0,
};

export const TRANSFORMATIVE_REACTION_ELEMENTS: Record<TransformativeReaction, ActualAttackElement> =
  {
    bloom: "dendro",
    hyperbloom: "dendro",
    burgeon: "dendro",
    burning: "pyro",
    swirl: "absorb",
    superconduct: "cryo",
    electroCharged: "electro",
    overloaded: "pyro",
    shattered: "phys",
  };

export const LUNAR_REACTION_ELEMENTS: Record<LunarReaction, ActualAttackElement> = {
  lunarCharged: "electro",
  lunarCryst: "geo",
  lunarBloom: "dendro",
};

export const TRANSFORMATIVE_REACTION_COEFFICIENTS: Record<TransformativeReaction, number> = {
  bloom: 2,
  hyperbloom: 3,
  burgeon: 3,
  burning: 0.25,
  swirl: 0.6,
  superconduct: 1.5,
  electroCharged: 2,
  overloaded: 2.75,
  shattered: 3,
};

export const NATURE_LUNAR_REACTION_COEFFICIENTS: Record<NatureLunarReaction, number> = {
  lunarCharged: 1.8,
  lunarCryst: 0.96,
};

export const DIRECT_LUNAR_REACTION_COEFFICIENTS: Record<LunarReaction, number> = {
  lunarCharged: 3,
  lunarCryst: 1.6,
  lunarBloom: 1,
};
