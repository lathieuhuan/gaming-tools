import type { CalcArtifacts } from "@Src/types";
import type {
  EntityBonus,
  EntityBonusStack,
  EntityBonusTargets,
  EntityBuff,
  ArtifactBonusCore,
  AttributeStat,
  CharacterBonusCore,
  ElementType,
  WeaponBonusCore,
  WithBonusTargets,
} from "@Src/backend/types";
import type { ArtifactAttribute, TotalAttribute } from "../calculation.types";
import type { BuffInfoWrap } from "./getCalculationStats.types";

import { CORE_STAT_TYPES, ELEMENT_TYPES } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal.constants";
import { applyPercent, toArray } from "@Src/utils";
import { TotalAttributeControl, type GetTotalAttributeType } from "../controls";
import { ArtifactCalc, EntityCalc } from "../utils";

export function calcArtifactAtribute(artifacts: CalcArtifacts, totalAttr: TotalAttributeControl): ArtifactAttribute;
export function calcArtifactAtribute(artifacts: CalcArtifacts, totalAttr: TotalAttribute): ArtifactAttribute;
export function calcArtifactAtribute(
  artifacts: CalcArtifacts,
  totalAttr: TotalAttribute | TotalAttributeControl
): ArtifactAttribute {
  const artAttr: ArtifactAttribute = {
    hp: 0,
    atk: 0,
    def: 0,
  };
  const isTotalAttributeControl = totalAttr instanceof TotalAttributeControl;

  for (const artifact of artifacts) {
    if (!artifact) continue;

    const { type, mainStatType, subStats } = artifact;
    const mainDesc = type[0].toUpperCase() + type.slice(1);
    const mainStat = ArtifactCalc.mainStatValueOf(artifact);

    artAttr[mainStatType] = (artAttr[mainStatType] || 0) + mainStat;

    if (isTotalAttributeControl) {
      totalAttr.addStable(mainStatType, mainStat, mainDesc);
    }

    for (const subStat of subStats) {
      artAttr[subStat.type] = (artAttr[subStat.type] || 0) + subStat.value;

      if (isTotalAttributeControl) {
        totalAttr.addStable(subStat.type, subStat.value, "Artifact sub-stat");
      }
    }
  }

  for (const statType of CORE_STAT_TYPES) {
    const percentStatValue = artAttr[`${statType}_`];

    if (percentStatValue) {
      const base = isTotalAttributeControl ? totalAttr.getBase(statType) : totalAttr[`${statType}_base`];

      artAttr[statType] += applyPercent(base, percentStatValue);
    }
    delete artAttr[`${statType}_`];
  }

  return artAttr;
}

function isFinalBonus(bonusStacks?: EntityBonusStack | EntityBonusStack[]) {
  if (bonusStacks) {
    const hasAnyFinalBonus = toArray(bonusStacks).some((stack) => {
      switch (stack.type) {
        case "ATTRIBUTE":
          return stack.field !== "base_atk";
        default:
          return false;
      }
    });
    return hasAnyFinalBonus;
  }
  return false;
}

function isTrulyFinalBonus(bonus: CharacterBonusCore | WeaponBonusCore | ArtifactBonusCore) {
  return (
    isFinalBonus(bonus.stacks) ||
    (typeof bonus.preExtra === "object" && isFinalBonus(bonus.preExtra.stacks)) ||
    (typeof bonus.sufExtra === "object" && isFinalBonus(bonus.sufExtra.stacks))
  );
}

export type AppliedBonus = {
  value: number;
  isStable: boolean;
};
type ApplyBonusArgs = {
  bonus: AppliedBonus;
  vision: ElementType;
  targets: EntityBonusTargets;
  inputs: number[];
  description: string;
  info: BuffInfoWrap;
  isStackable?: (paths: string | string[]) => boolean;
};
function applyBonus({ bonus, vision, targets, inputs, description, info, isStackable }: ApplyBonusArgs) {
  if (!bonus.value) return;

  for (const target of toArray(targets)) {
    if (isStackable && target.module.slice(0, 2) !== "id" && !isStackable(target.path)) {
      continue;
    }

    switch (target.module) {
      case ECalcStatModule.ATTR: {
        let path: AttributeStat | AttributeStat[];

        switch (target.path) {
          case "INP_ELMT": {
            const elmtIndex = inputs[target.inpIndex ?? 0];
            path = ELEMENT_TYPES[elmtIndex];
            break;
          }
          case "OWN_ELMT":
            path = vision;
            break;
          default:
            path = target.path;
        }

        if (bonus.isStable) {
          info.totalAttr.addStable(path, bonus.value, description);
        } else {
          info.totalAttr.addUnstable(path, bonus.value, description);
        }
        break;
      }
      case "ELMT_NA":
        for (const elmt of ELEMENT_TYPES) {
          info.attBonus.add(`NA.${elmt}`, target.path, bonus.value, description);
        }
        break;
      default:
        for (const module of toArray(target.module)) {
          info.attBonus.add(module, target.path, bonus.value, description);
        }
    }
  }
}

type Bonus = WithBonusTargets<EntityBonus<unknown>>;

type ApplyBonusArgsPick = Pick<ApplyBonusArgs, "description" | "info" | "inputs" | "isStackable">;

interface ApplyBonusesArgs<T extends Bonus> extends ApplyBonusArgsPick {
  buff: Pick<EntityBuff<T>, "effects">;
  fromSelf?: boolean;
  isFinal?: boolean;
  getBonus: (config: T, totalAttrType: GetTotalAttributeType) => AppliedBonus;
}
export function applyBonuses<T extends Bonus>(args: ApplyBonusesArgs<T>) {
  const { buff, fromSelf = false, isFinal, getBonus, ...applyArgs } = args;
  if (!buff.effects) return;

  for (const config of toArray(buff.effects)) {
    if (
      (isFinal === undefined || isFinal === isTrulyFinalBonus(config)) &&
      EntityCalc.isApplicableEffect(config, args.info, args.inputs, fromSelf)
    ) {
      const totalAttrType: GetTotalAttributeType =
        Array.isArray(config.targets) || config.targets.module !== ECalcStatModule.ATTR ? "ALL" : "STABLE";

      applyBonus({
        ...applyArgs,
        bonus: getBonus(config, totalAttrType),
        vision: args.info.appChar.vision,
        targets: config.targets,
      });
    }
  }
}
