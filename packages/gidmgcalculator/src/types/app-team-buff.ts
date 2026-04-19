import type { EntityBonus, ModifierSpec } from "./modifier-specs";

export type AppTeamBuff = ModifierSpec & {
  src: string;
  description: string;
  effects?: EntityBonus | EntityBonus[];
};
