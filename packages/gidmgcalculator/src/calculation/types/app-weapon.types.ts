import type { EntityBonus, EntityBonusEffect, EntityBuff } from "./app-entity";
import type { AttributeStat, CalcItemBasedOn, CalcItemType, WeaponType } from "./common.types";

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
  bonuses?: EntityBonus<WeaponBonusEffect>[];
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
  basedOn?: CalcItemBasedOn;
};

// ========== BONUS ==========

type WeaponBonusEffect = EntityBonusEffect;

export type WeaponBuff = EntityBuff<WeaponBonusEffect> & {
  /**
   * If number, it's the index of weapon's descriptions (AppWeapon.descriptions).
   * Default to 0.
   */
  description?: number | string | (number | string)[];
};
