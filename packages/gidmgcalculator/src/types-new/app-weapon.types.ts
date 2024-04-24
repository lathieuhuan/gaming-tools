import type {
  AppBonus,
  AppBonusAttributeStack,
  AppBonusElementStack,
  AppBonusNationStack,
  AppBuff,
} from "./app-common.types";

type WeaponEffectValueOption = {
  options: number[];
  /** Input's index for options. Default to 0 */
  inpIndex?: number;
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

type WeaponBonus = AppBonus<WeaponBonusStack> & {
  value: number | WeaponEffectValueOption;
  /**
   * Increment to value after each refinement.
   * Default to 1/3 of [value]. Fixed buff type has increment = 0
   */
  incre?: number;
  /** Apply after stacks */
  sufExtra?: number | Omit<WeaponBonus, "targets">;
  max?:
    | number
    // Only on Jadefall's Splendor
    | {
        value: number;
        incre: number;
      };
};

export type WeaponBuff = AppBuff<WeaponBonus> & {
  /** id to track stackable. Effects under the same buff id and have the same targets cannot be stacked */
  trackId?: string;
  /**
   * If number, it's the index of weapon's descriptions (AppWeapon.descriptions).
   * Default to 0.
   */
  description?: number | string;
  cmnStacks?: WeaponBonus["stacks"];
};
