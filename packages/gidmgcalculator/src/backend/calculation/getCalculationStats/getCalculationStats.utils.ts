import type {
  EntityBonus,
  EntityBonusStack,
  EntityBonusTarget,
  EntityBuff,
  ArtifactBonusCore,
  AttributeStat,
  CharacterBonusCore,
  ElementType,
  WeaponBonusCore,
  WithBonusTargets,
} from "@Src/backend/types";
import type { BuffInfoWrap } from "./getCalculationStats.types";

import { ELEMENT_TYPES } from "@Src/backend/constants";
import { toArray } from "@Src/utils";
import { EntityCalc } from "../utils";

type BonusCore = CharacterBonusCore | WeaponBonusCore | ArtifactBonusCore;

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

function isTrulyFinalBonus(bonus: BonusCore, cmnStacks: EntityBonusStack[]) {
  return (
    isFinalBonus(bonus.stacks) ||
    ("preExtra" in bonus && typeof bonus.preExtra === "object" && isFinalBonus(bonus.preExtra.stacks)) ||
    ("sufExtra" in bonus && typeof bonus.sufExtra === "object" && isFinalBonus(bonus.sufExtra.stacks)) ||
    (bonus.stackIndex !== undefined && isFinalBonus(cmnStacks[bonus.stackIndex]))
  );
}

export type AppliedBonus = {
  value: number;
  isStable: boolean;
};
type ApplyBonusArgs = {
  bonus: AppliedBonus;
  vision: ElementType;
  targets: EntityBonusTarget | EntityBonusTarget[];
  inputs: number[];
  description: string;
  info: BuffInfoWrap;
  isStackable?: (paths: string | string[]) => boolean;
};
function applyBonus({ bonus, vision, targets, inputs, description, info, isStackable }: ApplyBonusArgs) {
  if (!bonus.value) return;

  for (const target of toArray(targets)) {
    switch (target.module) {
      case "ATTR":
        if (!isStackable || isStackable(target.path)) {
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
        }
        break;
      case "PATT":
      case "ELMT":
      case "RXN":
        if (!isStackable || isStackable(target.path)) {
          info.bonusCalc.add(target.module, target.path, bonus.value, description);
        }
        break;
      case "ITEM":
        info.calcItemBuff.add(bonus.value, target, description);
        break;
      case "ELM_NA":
        if (info.appChar.weaponType === "catalyst" || info.infusedElement !== "phys") {
          info.bonusCalc.add("PATT", "NA.pct_", bonus.value, description);
        }
        break;
    }
  }
}

type Bonus = WithBonusTargets<EntityBonus<unknown>>;

type ApplyBonusArgsPick = Pick<ApplyBonusArgs, "description" | "info" | "inputs" | "isStackable">;

interface ApplyBonusesArgs<T extends Bonus> extends ApplyBonusArgsPick {
  buff: Pick<EntityBuff<T>, "trackId" | "cmnStacks" | "effects">;
  fromSelf?: boolean;
  isFinal?: boolean;
  getBonus: (config: T, commonStacks: number[]) => AppliedBonus;
}
export function applyBonuses<T extends Bonus>(args: ApplyBonusesArgs<T>) {
  const { buff, fromSelf = false, isFinal, getBonus, ...applyArgs } = args;
  if (!buff.effects) return;

  const cmnStacks = buff.cmnStacks ? toArray(buff.cmnStacks) : [];
  const commonStacks = cmnStacks.map((cmnStack) =>
    EntityCalc.getStackValue(cmnStack, args.info, args.inputs, fromSelf)
  );

  for (const config of toArray(buff.effects)) {
    if (
      (isFinal === undefined || isFinal === isTrulyFinalBonus(config, cmnStacks)) &&
      EntityCalc.isApplicableEffect(config, args.info, args.inputs, fromSelf)
    ) {
      applyBonus({
        ...applyArgs,
        bonus: getBonus(config, commonStacks),
        vision: args.info.appChar.vision,
        targets: config.targets,
      });
    }
  }
}
