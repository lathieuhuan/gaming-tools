import type {
  ArtifactBonusCore,
  AttributeStat,
  CharacterBonusCore,
  ElementType,
  EntityBonus,
  EntityBonusStack,
  EntityBonusTargets,
  EntityBuff,
  EntityPenaltyTarget,
  ResistanceReductionKey,
  WeaponBonusCore,
  WithBonusTargets,
} from "@Src/backend/types";
import type { GetTotalAttributeType } from "@Src/backend/controls";
import type { BuffInfoWrap, DebuffInfoWrap } from "./appliers.types";

import { ELEMENT_TYPES } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal.constants";
import { toArray } from "@Src/utils";
import { EntityCalc } from "../utils";

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
        for (const targetPath of toArray(target.path)) {
          let path: AttributeStat | AttributeStat[];

          switch (targetPath) {
            case "INP_ELMT": {
              const elmtIndex = inputs[target.inpIndex ?? 0];
              path = ELEMENT_TYPES[elmtIndex];
              break;
            }
            case "OWN_ELMT":
              path = vision;
              break;
            default:
              path = targetPath;
          }

          if (bonus.isStable) {
            info.totalAttr.addStable(path, bonus.value, description);
          } else {
            info.totalAttr.addUnstable(path, bonus.value, description);
          }
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

type ApplyPenaltyArgs = {
  penaltyValue: number;
  targets: EntityPenaltyTarget | EntityPenaltyTarget[];
  inputs: number[];
  description: string;
  info: DebuffInfoWrap;
};
export function applyPenalty(args: ApplyPenaltyArgs) {
  if (!args.penaltyValue) return;

  for (const target of toArray(args.targets)) {
    let path: ResistanceReductionKey;

    if (typeof target === "string") {
      path = target;
    } else {
      const elmtIndex = args.inputs[target.inpIndex ?? 0];
      path = ELEMENT_TYPES[elmtIndex];
    }

    args.info.resistReduct.add(path, args.penaltyValue, args.description);
  }
}
