import { CalcItemType } from "./app-entity/app-entity-common.types";
import { EntityBuff } from "./app-entity/app-entity.types";
import { EntityBonus, EntityBonusCore } from "./app-entity/entity-bonus.types";
import { AttributeStat, WeaponType } from "./common.types";

export type AppWeapon = {
  /** This is id */
  code: number;
  beta?: boolean;
  type: WeaponType;
  name: string;
  rarity: number;
  icon: string;
  mainStatScale: string;
  subStat?: {
    type: AttributeStat;
    scale: string;
  };
  passiveName?: string;
  descriptions?: string[];
  bonuses?: WeaponBonus[];
  buffs?: WeaponBuff[];
  calcItems?: WeaponCalcItem[];
};

type WeaponCalcItem = {
  name: string;
  /** Default to 'attack' */
  type?: CalcItemType;
  value: number;
  /** Default to 1/3 [multFactors] */
  incre?: number;
  /** Default to 'atk' */
  basedOn?: "atk" | "hp";
};

// ========== BONUS ==========

type WeaponBonusCore = EntityBonusCore<{
  /**
   * Increment to value after each refinement.
   * Default to 1/3 of [value]. Fixed buff type has increment = 0.
   * Added before preExtra
   */
  incre?: number;
  max?:
    | number
    // Only on Jadefall's Splendor
    | {
        value: number;
        incre: number;
      };
}>;

type WeaponBonus = EntityBonus<WeaponBonusCore>;

type WeaponBuff = EntityBuff<WeaponBonus> & {
  /**
   * If number, it's the index of weapon's descriptions (AppWeapon.descriptions).
   * Default to 0.
   */
  description?: number | string | (number | string)[];
};
