import type { AttackElement, LunarReaction, NatureLunarReaction } from "@/types";

export const QUICKEN_BUFF_LABEL = {
  spread: "Spread reaction",
  aggravate: "Aggravate reaction",
};

export const LUNAR_ATTACK_ELEMENT: Record<LunarReaction, AttackElement> = {
  lunarCharged: "electro",
  lunarBloom: "dendro",
  lunarCryst: "geo",
};

export const LUNAR_REACTION_COEFFICIENT: Record<NatureLunarReaction, number> = {
  lunarCharged: 1.8,
  lunarCryst: 0.96,
};

export const LUNAR_ATTACK_COEFFICIENT: Record<LunarReaction, number> = {
  lunarCharged: 3,
  lunarBloom: 1,
  lunarCryst: 1.6,
};
