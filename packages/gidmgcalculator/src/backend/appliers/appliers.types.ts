import type { BareBonus, GetBonusArgs } from "../bonus-getters";
import type {
  ArtifactBonusCore,
  AttackBonusKey,
  AttackBonusType,
  AttributeStat,
  CharacterBonusCore,
  ElementType,
  EntityBonus,
  EntityBonusCore,
  EntityBonusTargets,
  EntityBuff,
  WeaponBonusCore,
} from "../types";
import type { ResistanceReductionControl } from "../controls";
import type { CalculationInfo } from "../utils";

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

type GetAppliedBonusesArgs<TEntityBonusCore extends EntityBonusCore> = ApplyBonusArgsPick & {
  buff: Pick<EntityBuff<TEntityBonusCore>, "effects" | "unstackableId">;
  getBareBonus: (
    args: Pick<GetBonusArgs<EntityBonus<TEntityBonusCore>>, "config" | "getTotalAttrFromSelf">
  ) => BareBonus;
  fromSelf?: boolean;
  isFinal?: boolean;
};

export type GetAppliedBonuses = (args: GetAppliedBonusesArgs<EntityBonus>) => AppliedBonuses;

type ApplyBuffArgs<TEntityBonusCore extends EntityBonusCore> = Omit<
  GetAppliedBonusesArgs<EntityBonus<TEntityBonusCore>>,
  "getBareBonus"
>;

export type ApplyCharacterBuffArgs = ApplyBuffArgs<CharacterBonusCore>;

export type ApplyWeaponBuffArgs = ApplyBuffArgs<WeaponBonusCore> & { refi: number };

export type ApplyArtifactBuffArgs = ApplyBuffArgs<ArtifactBonusCore>;

// ========== DEBUFF ==========

export type DebuffInfoWrap = CalculationInfo & {
  resistReduct: ResistanceReductionControl;
};
