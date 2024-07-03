import type {
  ArtifactBonusCore,
  AttributeStack,
  AttributeStat,
  CharacterBonusCore,
  EntityBonus,
  EntityBonusStack,
  WeaponBonusCore,
  WithBonusTargets,
} from "@Src/backend/types";
import type { GetTotalAttributeType, TotalAttributeControl } from "@Src/backend/controls";
import type {
  ApplyArtifactBuffArgs,
  ApplyBonusArgs,
  ApplyBonusesArgs,
  ApplyCharacterBuffArgs,
  ApplyWeaponBuffArgs,
} from "./appliers.types";

import { ELEMENT_TYPES } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal";
import { toArray } from "@Src/utils";
import { CalculationInfo, EntityCalc } from "@Src/backend/utils";
import { ModifierStackingControl } from "@Src/backend/controls";
import { getArtifactBonus, getCharacterBonus, getWeaponBonus } from "@Src/backend/bonus-getters";

type GetTotalAttrFromSelf = (field: AttributeStack["field"], totalAttrType: GetTotalAttributeType) => number;

type ApplyBonus = (args: ApplyBonusArgs) => void;

type ApplyBonuses = (args: ApplyBonusesArgs<WithBonusTargets<EntityBonus>>) => void;

export class BuffApplierCore {
  protected calcInfo: CalculationInfo;
  private modStackingCtrl = new ModifierStackingControl();

  protected getTotalAttrFromSelf: GetTotalAttrFromSelf = () => 0;

  constructor(info: CalculationInfo, totalAttr?: TotalAttributeControl) {
    this.calcInfo = info;

    if (totalAttr) {
      this.getTotalAttrFromSelf = totalAttr.getTotal;
    }
  }

  private applyBonus: ApplyBonus = (args) => {
    const { bonus, isStackable, description } = args;
    if (!bonus.value) return;

    for (const target of toArray(args.targets)) {
      if (isStackable && target.module.slice(0, 2) !== "id" && !isStackable(target.path)) {
        continue;
      }

      switch (target.module) {
        case ECalcStatModule.ATTR: {
          for (const targetPath of toArray(target.path)) {
            let path: AttributeStat;

            switch (targetPath) {
              case "INP_ELMT": {
                const elmtIndex = args.inputs[target.inpIndex ?? 0];
                path = ELEMENT_TYPES[elmtIndex];
                break;
              }
              case "OWN_ELMT":
                path = args.vision;
                break;
              default:
                path = targetPath;
            }

            if (bonus.isStable) {
              args.applyAttrBonus({
                stable: true,
                stat: path,
                value: bonus.value,
                description,
              });
            } else {
              args.applyAttrBonus({ stable: false, stat: path, value: bonus.value, description });
            }
          }
          break;
        }
        case "ELMT_NA":
          for (const elmt of ELEMENT_TYPES) {
            args.applyAttkBonus({
              module: `NA.${elmt}`,
              path: target.path,
              value: bonus.value,
              description,
            });
          }
          break;
        default:
          for (const module of toArray(target.module)) {
            args.applyAttkBonus({ module, path: target.path, value: bonus.value, description });
          }
      }
    }
  };

  private applyBonuses: ApplyBonuses = (args) => {
    const { buff, fromSelf = false, isFinal, getBonus, ...applyArgs } = args;
    if (!buff.effects) return;

    const isStackable: ApplyBonusArgs["isStackable"] = (paths) => {
      return this.modStackingCtrl?.isStackable({ trackId: buff.trackId, paths }) ?? true;
    };

    for (const config of toArray(buff.effects)) {
      if (
        (isFinal === undefined || isFinal === isTrulyFinalBonus(config)) &&
        EntityCalc.isApplicableEffect(config, this.calcInfo, args.inputs, fromSelf)
      ) {
        const totalAttrType: GetTotalAttributeType =
          Array.isArray(config.targets) || config.targets.module !== ECalcStatModule.ATTR ? "ALL" : "STABLE";

        this.applyBonus({
          ...applyArgs,
          bonus: getBonus({
            config,
            getTotalAttrFromSelf: (stat) => this.getTotalAttrFromSelf(stat, totalAttrType),
          }),
          vision: this.calcInfo.appChar.vision,
          targets: config.targets,
          isStackable,
        });
      }
    }
  };

  protected _applyCharacterBuff = (args: ApplyCharacterBuffArgs) => {
    const { fromSelf = false } = args;

    this.applyBonuses({
      ...args,
      getBonus: (getArgs) => {
        return getCharacterBonus({
          ...getArgs,
          inputs: args.inputs,
          fromSelf,
          info: this.calcInfo,
        });
      },
    });
  };

  protected _applyWeaponBuff = (args: ApplyWeaponBuffArgs) => {
    const { fromSelf = false } = args;

    this.applyBonuses({
      ...args,
      getBonus: (getArgs) => {
        return getWeaponBonus({
          ...getArgs,
          refi: args.refi,
          inputs: args.inputs,
          fromSelf,
          info: this.calcInfo,
        });
      },
    });
  };

  protected _applyArtifactBuff = (args: ApplyArtifactBuffArgs) => {
    const { fromSelf = false } = args;

    this.applyBonuses({
      ...args,
      getBonus: (getArgs) => {
        return getArtifactBonus({
          ...getArgs,
          inputs: args.inputs,
          fromSelf,
          info: this.calcInfo,
        });
      },
    });
  };
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
