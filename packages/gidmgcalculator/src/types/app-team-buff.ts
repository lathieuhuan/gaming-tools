import type { BonusSpec, ModifierBaseSpec } from "./modifier-specs";

export type AppTeamBuff = ModifierBaseSpec & {
  src: string;
  description: string;
  effects?: BonusSpec | BonusSpec[];
};
