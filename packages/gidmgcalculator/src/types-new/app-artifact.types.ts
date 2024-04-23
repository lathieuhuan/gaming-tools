import type { WeaponType } from "@Src/types";
import type { AppBonus, AppBonusAttributeStack, AppBonusElementStack, AppBuff } from "./app-common.types";

type ArtifactEffectValueOption = {
  options: number[];
  /** Input's index for options. Default to 0 */
  inpIndex?: number;
};

type InputStack = {
  type: "INPUT";
  /** If number, default to 0 */
  index?: number;
};

type ArtifactBonusStack = InputStack | AppBonusAttributeStack | AppBonusElementStack;

type ArtifactBonus = AppBonus<ArtifactBonusStack> & {
  forWeapons?: WeaponType[];
  value: number | ArtifactEffectValueOption;
  /** Apply after stacks */
  sufExtra?: number | Omit<ArtifactBonus, "targets">;
  max?: number;
};

type ArtifactBuff = AppBuff<ArtifactBonus> & {
  /** id to track stackable. Effects under the same buff id and have the same targets cannot be stacked */
  trackId?: string;
  description: string | number | number[];
};
