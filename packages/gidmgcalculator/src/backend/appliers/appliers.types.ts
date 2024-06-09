import type { AppliedBonus, GetBonusArgs } from "@Src/backend/bonus-getters";
import type {
  AttackBonusKey,
  AttackBonusType,
  AttributeStat,
  ElementType,
  EntityBonus,
  EntityBonusTargets,
  EntityBuff,
} from "@Src/backend/types";

export type ApplyBonusArgs = {
  bonus: AppliedBonus;
  vision: ElementType;
  targets: EntityBonusTargets;
  inputs: number[];
  description: string;
  isStackable?: (paths: string | string[]) => boolean;
  applyAttrBonus: (args: {
    stable: boolean;
    keys: AttributeStat | AttributeStat[];
    value: number;
    description: string;
  }) => void;
  applyAttkBonus: (args: { module: AttackBonusType; path: AttackBonusKey; value: number; description: string }) => void;
};

export type BonusConfig = EntityBonus<unknown>;

type ApplyBonusArgsPick = Pick<ApplyBonusArgs, "description" | "inputs" | "applyAttrBonus" | "applyAttkBonus">;

export type ApplyBonusesArgs<T extends BonusConfig> = ApplyBonusArgsPick & {
  buff: Pick<EntityBuff<T>, "effects" | "trackId">;
  getBonus: (args: Pick<GetBonusArgs<T>, "config" | "getTotalAttrFromSelf">) => AppliedBonus;
  fromSelf?: boolean;
  isFinal?: boolean;
};
