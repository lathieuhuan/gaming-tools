import type { PathType } from "./common";
import type { AppEntityBonus, AppEntityPassiveAbility } from "./app-entity";

type AppLightConeBonus = AppEntityBonus;

type AppLightConeAbility = AppEntityPassiveAbility;

export type AppLightCone = {
  id: number;
  beta?: boolean;
  name: string;
  rarity: number;
  path: PathType;
  statsScale: number[];
  passiveName: string;
  description: string | string[];
  bonuses?: AppLightConeBonus | AppLightConeBonus[];
  abilities?: AppLightConeAbility;
};
