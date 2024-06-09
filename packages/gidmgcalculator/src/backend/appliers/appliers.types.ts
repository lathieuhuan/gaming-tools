import type { AppliedBonus, GetBonusArgs } from "@Src/backend/bonus-getters";
import type { ElementType, EntityBonus, EntityBonusTargets, EntityBuff } from "@Src/backend/types";

export type ApplyBonusArgs = {
  bonus: AppliedBonus;
  vision: ElementType;
  targets: EntityBonusTargets;
  inputs: number[];
  description: string;
  isStackable?: (paths: string | string[]) => boolean;
};

export type BonusConfig = EntityBonus<unknown>;

type ApplyBonusArgsPick = Pick<ApplyBonusArgs, "description" | "inputs">;

export type ApplyBonusesArgs<T extends BonusConfig> = ApplyBonusArgsPick & {
  buff: Pick<EntityBuff<T>, "effects" | "trackId">;
  getBonus: (args: Pick<GetBonusArgs<T>, "config" | "getTotalAttrFromSelf">) => AppliedBonus;
  fromSelf?: boolean;
  isFinal?: boolean;
};
