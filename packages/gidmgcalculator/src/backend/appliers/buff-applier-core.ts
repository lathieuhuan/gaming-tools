import type {
  ArtifactBonusCore,
  AttackBonusKey,
  AttackBonusType,
  AttributeStack,
  AttributeStat,
  CharacterBonusCore,
  EntityBonusStack,
  WeaponBonusCore,
  WithBonusTargets,
} from "@Src/backend/types";
import type { GetTotalAttributeType, ModifierStackingControl, TotalAttributeControl } from "@Src/backend/controls";
import type { ApplyBonusArgs, ApplyBonusesArgs, BonusConfig } from "./appliers.types";

import { ELEMENT_TYPES } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal";
import { toArray } from "@Src/utils";
import { CalculationInfo, EntityCalc } from "@Src/backend/utils";

type GetTotalAttrFromSelf = (field: AttributeStack["field"], totalAttrType: GetTotalAttributeType) => number;

type ApplyBonus = (args: ApplyBonusArgs) => void;

type ApplyBonuses = (args: ApplyBonusesArgs<WithBonusTargets<BonusConfig>>) => void;

export type ApplyAttrBonus = (args: {
  stable: boolean;
  keys: AttributeStat | AttributeStat[];
  value: number;
  description: string;
}) => void;

export type ApplyAttkBonus = (args: {
  module: AttackBonusType;
  path: AttackBonusKey;
  value: number;
  description: string;
}) => void;

export class BuffApplierCore {
  protected info: CalculationInfo;
  private modStackingCtrl?: ModifierStackingControl;

  private applyAttrBonus: ApplyAttrBonus = () => {};

  private applyAttkBonus: ApplyAttkBonus = () => {};

  private getTotalAttrFromSelf: GetTotalAttrFromSelf = () => 0;

  constructor(
    info: CalculationInfo,
    applyAttrBonus: ApplyAttrBonus,
    applyAttkBonus: ApplyAttkBonus,
    totalAttr: TotalAttributeControl,
    modStackingCtrl?: ModifierStackingControl
  ) {
    this.info = info;
    this.applyAttrBonus = applyAttrBonus;
    this.applyAttkBonus = applyAttkBonus;
    this.getTotalAttrFromSelf = totalAttr.getTotal;
    this.modStackingCtrl = modStackingCtrl;
  }

  private applyBonus: ApplyBonus = ({ bonus, vision, targets, inputs, isStackable, description }) => {
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
              this.applyAttrBonus({
                stable: true,
                keys: path,
                value: bonus.value,
                description,
              });
            } else {
              this.applyAttrBonus({ stable: false, keys: path, value: bonus.value, description });
            }
          }
          break;
        }
        case "ELMT_NA":
          for (const elmt of ELEMENT_TYPES) {
            this.applyAttkBonus({
              module: `NA.${elmt}`,
              path: target.path,
              value: bonus.value,
              description,
            });
          }
          break;
        default:
          for (const module of toArray(target.module)) {
            this.applyAttkBonus({ module, path: target.path, value: bonus.value, description });
          }
      }
    }
  };

  applyBonuses: ApplyBonuses = (args) => {
    const { buff, fromSelf = false, isFinal, getBonus, ...applyArgs } = args;
    if (!buff.effects) return;

    const isStackable: ApplyBonusArgs["isStackable"] = (paths) => {
      return this.modStackingCtrl?.isStackable({ trackId: buff.trackId, paths }) ?? true;
    };

    for (const config of toArray(buff.effects)) {
      if (
        (isFinal === undefined || isFinal === isTrulyFinalBonus(config)) &&
        EntityCalc.isApplicableEffect(config, this.info, args.inputs, fromSelf)
      ) {
        const totalAttrType: GetTotalAttributeType =
          Array.isArray(config.targets) || config.targets.module !== ECalcStatModule.ATTR ? "ALL" : "STABLE";

        this.applyBonus({
          ...applyArgs,
          bonus: getBonus({
            config,
            getTotalAttrFromSelf: (stat) => this.getTotalAttrFromSelf(stat, totalAttrType),
          }),
          vision: this.info.appChar.vision,
          targets: config.targets,
          isStackable,
        });
      }
    }
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
