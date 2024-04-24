import type { AppBonusTarget, AttributeStat, ElementType } from "@Src/types";
import type { BuffInfoWrap } from "../types";
import type { AppBonus, AppBuff, WithBonusTargets } from "@Src/types/app-common.types";
import { ELEMENT_TYPES } from "@Src/constants";
import { toArray } from "@Src/utils";

type Stack = {
  type: string;
  field?: string;
};
export function isFinalBonus(bonusStacks?: Stack | Stack[]) {
  if (bonusStacks) {
    const isFinal = (stack: Stack) =>
      (stack.type === "ATTRIBUTE" && stack.field !== "base_atk") || stack.type === "BOL";
    return Array.isArray(bonusStacks) ? bonusStacks.some(isFinal) : isFinal(bonusStacks);
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
