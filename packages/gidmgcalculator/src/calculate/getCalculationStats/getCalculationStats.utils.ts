import type { AppBonusTarget, AttributeStat, ElementType } from "@Src/types";
import type { BuffInfoWrap } from "../types";
import type { AppBonus, AppBuff, WithBonusTargets } from "@Src/types/app-common.types";
import { ELEMENT_TYPES } from "@Src/constants";
import { toArray } from "@Src/utils";
import { CharacterBonusStack } from "@Src/types/app-character.types";
import { WeaponBonusStack } from "@Src/types/app-weapon.types";
import { ArtifactBonusStack } from "@Src/types/app-artifact.types";

type BonusStack = CharacterBonusStack | WeaponBonusStack | ArtifactBonusStack;

export function isFinalBonus(bonusStacks?: BonusStack | BonusStack[]) {
  if (bonusStacks) {
    const hasAnyFinalBonus = toArray(bonusStacks).some((stack) => {
      switch (stack.type) {
        case "ATTRIBUTE":
          return stack.field !== "base_atk";
        case "C_STATUS":
          return stack.status !== "BOL";
        default:
          return false;
      }
    });
    return hasAnyFinalBonus;
  }
  return false;
}

export type AppliedBonus = {
  value: number;
  isStable: boolean;
};
type ApplyBonusArgs = {
  bonus: AppliedBonus;
  vision: ElementType;
  targets: AppBonusTarget | AppBonusTarget[];
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
            case "INP_ELMT":
              const elmtIndex = inputs[target.inpIndex ?? 0];
              path = ELEMENT_TYPES[elmtIndex];
              break;
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
        info.bonusCalc.add(target.module, target.path, bonus.value, description);
        break;
      case "ITEM":
        info.calcItemBuffs.push({
          ids: target.id,
          bonus: {
            [target.path]: { desc: description, value: bonus.value },
          },
        });
        break;
      case "C_STATUS":
        // #to-do: make & use CharacterStatusCalc
        info.charStatus.BOL += bonus.value;
        break;
      case "ELM_NA":
        if (info.appChar.weaponType === "catalyst" || info.infusedElement !== "phys") {
          info.bonusCalc.add("PATT", "NA.pct_", bonus.value, description);
        }
        break;
    }
  }
}

type Bonus = WithBonusTargets<AppBonus<unknown>>;

type ApplyBonusArgsPick = Pick<ApplyBonusArgs, "description" | "info" | "inputs" | "isStackable">;

interface ApplyBonusesArgs<T extends Bonus> extends ApplyBonusArgsPick {
  buff: Pick<AppBuff<T>, "trackId" | "cmnStacks" | "effects">;
  isApplicable: (config: T) => boolean;
  getBonus: (config: T) => AppliedBonus;
}
export function applyBonuses<T extends Bonus>(args: ApplyBonusesArgs<T>) {
  const { buff, isApplicable, getBonus, ...applyArgs } = args;
  if (!buff.effects) return;

  for (const config of toArray(buff.effects)) {
    if (isApplicable(config)) {
      applyBonus({
        ...applyArgs,
        bonus: getBonus(config),
        vision: args.info.appChar.vision,
        targets: config.targets,
      });
    }
  }
}

interface BuffApplierStructure {
  getBonus(...args: unknown[]): number;
}

class WeaponBuffApplier implements BuffApplierStructure {
  getBonus(a: number, b: string): number {
    return 2
  }
}