import type { AttributeStat, ModInputConfig, ModifierAffectType, WeaponType } from "./global.types";
import type { AttackPatternPath } from "./calculation-core.types";

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

type AttributeStack = {
  type: "ATTRIBUTE";
  field: "hp" | "base_atk" | "def" | "em" | "er_";
  baseline?: number;
};

type ElementStack = {
  type: "ELEMENT";
  element: "same_included" | "same_excluded" | "different";
  max?: number;
};

/** Only on Watatsumi series */
type EnergyStack = {
  type: "ENERGY";
};

/** Only on Lythic series */
type NationStack = {
  type: "NATION";
};

export type WeaponBonusStack = ElementStack | AttributeStack | InputStack | EnergyStack | NationStack;

type WeaponEffectValueOption = {
  options: number[];
  /** Input's index for options. Default to 0 */
  inpIndex?: number;
};

export type WeaponBonus = {
  value: number | WeaponEffectValueOption;
  /**
   * Increment to value after each refinement.
   * Default to 1/3 of [value]. Fixed buff type has increment = 0
   */
  incre?: number;
  stacks?: WeaponBonusStack | WeaponBonusStack[];
  /** Apply after stacks */
  sufExtra?: number | Omit<WeaponBonus, "targets">;
  targets: {
    /** totalAttr */
    ATTR?: "own_elmt" | AttributeStat | AttributeStat[];
    /** attPattBonus */
    PATT?: AttackPatternPath | AttackPatternPath[];
  };
  max?:
    | number
    // Only on Jadefall's Splendor
    | {
        value: number;
        incre: number;
      };
  /**
   * For this buff to available, the input at the [source] must meet [value] by [type].
   * If number, it's [value], [source] is 0, [type] is [equal]
   */
  checkInput?:
    | number
    // Only on Ballad of the Fjords
    | {
        value: number;
        /**
         * When number, it's the input's index. [various_vision] only on Ballad of the Fjords.
         * Default to 0.
         */
        source?: number | "various_vision";
        /** Default to [equal] */
        type?: "equal" | "min" | "max";
      };
};

export type WeaponBuff = {
  /** id to track stackable. Effects under the same buff id and have the same targets cannot be stacked */
  trackId?: string;
  /** This is id */
  index: number;
  affect: ModifierAffectType;
  inputConfigs?: ModInputConfig[];
  /**
   * If number, it's the index of weapon's descriptions (AppWeapon.descriptions).
   * Default to 0.
   */
  description?: number | string;
  cmnStacks?: WeaponBonus["stacks"];
  effects: WeaponBonus | WeaponBonus[];
};

type WeaponCalcItem = {
  name: string;
  /** Default to 'attack' */
  type?: "attack" | "healing" | "shield" | "other";
  value: number;
  /** Default to 1/3 [multFactors] */
  incre?: number;
  /** Default to 'atk' */
  baseOn?: "atk" | "hp";
};
