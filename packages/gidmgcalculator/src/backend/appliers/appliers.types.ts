import type { AppliedBonus, GetBonusArgs } from "@Src/backend/bonus-getters";
import type {
  ArtifactBonusCore,
  AttackBonusKey,
  AttackBonusType,
  AttributeStat,
  CharacterBonusCore,
  ElementType,
  EntityBonus,
  EntityBonusTargets,
  EntityBuff,
  WeaponBonusCore,
  WithBonusTargets,
} from "@Src/backend/types";
import type { ResistanceReductionControl } from "@Src/backend/controls";
import type { CalculationInfo } from "@Src/backend/utils";

export type ApplyBonusArgs = {
  bonus: AppliedBonus;
  vision: ElementType;
  targets: EntityBonusTargets;
  inputs: number[];
  description: string;
  isStackable?: (paths: string | string[]) => boolean;
  applyAttrBonus: (args: { stat: AttributeStat; value: number; description: string; stable: boolean }) => void;
  applyAttkBonus: (args: { module: AttackBonusType; path: AttackBonusKey; value: number; description: string }) => void;
};

type ApplyBonusArgsPick = Pick<ApplyBonusArgs, "description" | "inputs" | "applyAttrBonus" | "applyAttkBonus">;

export type ApplyBonusesArgs<T extends EntityBonus> = ApplyBonusArgsPick & {
  buff: Pick<EntityBuff<T>, "effects" | "trackId">;
  getBonus: (args: Pick<GetBonusArgs<T>, "config" | "getTotalAttrFromSelf">) => AppliedBonus;
  fromSelf?: boolean;
  isFinal?: boolean;
};

export type ApplyBuffArgs<T extends EntityBonus> = Omit<ApplyBonusesArgs<WithBonusTargets<T>>, "getBonus">;

export type ApplyCharacterBuffArgs = ApplyBuffArgs<CharacterBonusCore>;

export type ApplyWeaponBuffArgs = ApplyBuffArgs<WeaponBonusCore> & { refi: number };

export type ApplyArtifactBuffArgs = ApplyBuffArgs<ArtifactBonusCore>;

// ========== DEBUFF ==========

export type DebuffInfoWrap = CalculationInfo & {
  resistReduct: ResistanceReductionControl;
};
