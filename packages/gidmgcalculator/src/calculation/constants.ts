import type { AttributeStat } from "@/types";

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
