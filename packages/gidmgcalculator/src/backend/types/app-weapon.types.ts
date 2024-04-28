import type { AttributeStat, WeaponType } from "./common.types";
import type {
  AppBonus,
  AppBonusAttributeStack,
  AppBonusElementStack,
  AppBonusNationStack,
  AppBuff,
  CalcItemType,
  WithBonusTargets,
} from "./app-entity.types";

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
  baseOn?: "atk" | "hp";
};

// ========== BONUS STACKS ==========

type InputIndex = {
  /** Only on Tulaytullah's Remembrance */
  value: number;
  ratio?: number;
};
type InputStack = {
  type: "INPUT";
  /** Default to 0 */
  index?: number | InputIndex[];
  /**
   * Input's index when activated (equal to 1), value is doubled.
   * Only on Liyue Series.
   */
  doubledAt?: number;
};
/** Only on Watatsumi series */
type EnergyStack = {
  type: "ENERGY";
};

export type WeaponBonusStack =
  | InputStack
  | AppBonusAttributeStack
  | AppBonusElementStack
  | AppBonusNationStack
  | EnergyStack;

// ========== BONUS ==========

export type WeaponBonusCore = AppBonus<WeaponBonusStack> & {
  /**
   * Increment to value after each refinement.
   * Default to 1/3 of [value]. Fixed buff type has increment = 0
   */
  incre?: number;
  /** Apply after stacks */
  sufExtra?: number | WeaponBonusCore;
  max?:
    | number
    // Only on Jadefall's Splendor
    | {
        value: number;
        incre: number;
      };
};

type WeaponBonus = WithBonusTargets<WeaponBonusCore>;

export type WeaponBuff = AppBuff<WeaponBonus> & {
  /**
   * If number, it's the index of weapon's descriptions (AppWeapon.descriptions).
   * Default to 0.
   */
  description?: number | string;
};
