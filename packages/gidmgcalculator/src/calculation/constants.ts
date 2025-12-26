import type { AttackElement, LunarReaction, AttributeStat, LunarType } from "@/types";

type ResonanceStat = {
  key: AttributeStat;
  value: number;
};

export const AUTO_RESONANCE_STAT: Record<string, ResonanceStat> = {
  pyro: { key: "atk_", value: 25 },
  geo: { key: "shieldS_", value: 15 },
  hydro: { key: "hp_", value: 25 },
  dendro: { key: "em", value: 50 },
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
