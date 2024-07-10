import type { BareBonus, GetBonusArgs } from "@Src/backend/bonus-getters";
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

export type AppliedAttributeBonus = BareBonus & {
  toStat: AttributeStat;
  isStable: boolean;
  description: string;
};

export type AppliedAttackBonus = Pick<BareBonus, "id" | "value"> & {
  toType: AttackBonusType;
  toKey: AttackBonusKey;
  description: string;
};

export type IsStackableAppliedBonus = (paths: string | string[]) => boolean;

type ApplyEffectBonusesArgs = {
  bonus: BareBonus;
  vision: ElementType;
  targets: EntityBonusTargets;
  inputs: number[];
  description: string;
  isStackable?: IsStackableAppliedBonus;
  applyAttrBonus: (bonus: AppliedAttributeBonus) => void;
  applyAttkBonus: (bonus: AppliedAttackBonus) => void;
};

export type AppliedBonuses = {
  attrBonuses: AppliedAttributeBonus[];
  attkBonuses: AppliedAttackBonus[];
};

export type ApplyEffectBonuses = (args: ApplyEffectBonusesArgs) => void;

type ApplyBonusArgsPick = Pick<ApplyEffectBonusesArgs, "description" | "inputs">;

type GetAppliedBonusesArgs<T extends EntityBonus> = ApplyBonusArgsPick & {
  buff: Pick<EntityBuff<T>, "effects" | "trackId">;
  getBareBonus: (args: Pick<GetBonusArgs<T>, "config" | "getTotalAttrFromSelf">) => BareBonus;
  fromSelf?: boolean;
  isFinal?: boolean;
};

export type GetAppliedBonuses = (args: GetAppliedBonusesArgs<WithBonusTargets<EntityBonus>>) => AppliedBonuses;

type ApplyBuffArgs<T extends EntityBonus> = Omit<GetAppliedBonusesArgs<WithBonusTargets<T>>, "getBareBonus">;

export type ApplyCharacterBuffArgs = ApplyBuffArgs<CharacterBonusCore>;

export type ApplyWeaponBuffArgs = ApplyBuffArgs<WeaponBonusCore> & { refi: number };

export type ApplyArtifactBuffArgs = ApplyBuffArgs<ArtifactBonusCore>;

// ========== DEBUFF ==========

export type DebuffInfoWrap = CalculationInfo & {
  resistReduct: ResistanceReductionControl;
};
