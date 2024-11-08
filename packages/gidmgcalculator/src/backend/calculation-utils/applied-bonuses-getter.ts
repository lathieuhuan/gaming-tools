import type {
  AppliedBonuses,
  AttributeStat,
  BareBonus,
  CalculationInfo,
  EntityBonusBasedOn,
  EntityBonusCore,
  EntityBonusTargets,
  EntityBuff,
} from "../types";

import Array_ from "@Src/utils/array-utils";
import { ELEMENT_TYPES } from "../constants";
import { ECalcStatModule } from "../constants/internal";
import { ModifierStackingControl, TotalAttributeControl } from "../controls";
import { isApplicableEffect } from "./isApplicableEffect";
import { BareBonusGetter, type GetBareBonusSupportInfo } from "./bare-bonus-getter";

type ApplyBonusSupportInfo = {
  description: string;
  inputs: number[];
  unstackableId?: string;
};

export class AppliedBonusesGetter extends BareBonusGetter {
  private modStackingCtrl = new ModifierStackingControl();

  constructor(protected info: CalculationInfo, protected totalAttrCtrl?: TotalAttributeControl) {
    super(info, totalAttrCtrl);
  }

  private isFinalBonus(basedOn?: EntityBonusBasedOn) {
    if (basedOn) {
      const field = typeof basedOn === "string" ? basedOn : basedOn.field;
      return field !== "base_atk";
    }
    return false;
  }

  private isTrulyFinalBonus(bonus: EntityBonusCore) {
    return (
      this.isFinalBonus(bonus.basedOn) ||
      (typeof bonus.preExtra === "object" && this.isFinalBonus(bonus.preExtra.basedOn)) ||
      (typeof bonus.sufExtra === "object" && this.isFinalBonus(bonus.sufExtra.basedOn))
    );
  }

  private applyBonus(
    bonus: BareBonus,
    targets: EntityBonusTargets,
    support: ApplyBonusSupportInfo,
    result: AppliedBonuses = {
      attkBonuses: [],
      attrBonuses: [],
    }
  ): AppliedBonuses {
    if (!bonus.value) return result;

    const { description } = support;

    for (const target of Array_.toArray(targets)) {
      const isStackable =
        target.module.slice(0, 2) !== "id" &&
        this.modStackingCtrl.isStackable({ trackId: support.unstackableId, paths: target.path });

      if (!isStackable) continue;

      switch (target.module) {
        case "ATTR": {
          for (const targetPath of Array_.toArray(target.path)) {
            let toStat: AttributeStat;

            switch (targetPath) {
              case "INP_ELMT": {
                const elmtIndex = support.inputs[target.inpIndex ?? 0];
                toStat = ELEMENT_TYPES[elmtIndex];
                break;
              }
              case "OWN_ELMT":
                toStat = this.info.appChar.vision;
                break;
              default:
                toStat = targetPath;
            }

            result.attrBonuses.push({
              ...bonus,
              toStat,
              description,
            });
          }
          break;
        }
        case "ELMT_NA":
          for (const elmt of ELEMENT_TYPES) {
            result.attkBonuses.push({
              id: bonus.id,
              toType: `NA.${elmt}`,
              toKey: target.path,
              value: bonus.value,
              description,
            });
          }
          break;
        default:
          for (const module of Array_.toArray(target.module)) {
            result.attkBonuses.push({
              id: bonus.id,
              toType: module,
              toKey: target.path,
              value: bonus.value,
              description,
            });
          }
      }
    }
    return result;
  }

  getAppliedBonuses(
    buff: Pick<EntityBuff, "effects" | "unstackableId">,
    support: GetBareBonusSupportInfo,
    description: string,
    isFinal?: boolean
  ) {
    const result: AppliedBonuses = {
      attkBonuses: [],
      attrBonuses: [],
    };
    if (!buff.effects) return result;

    for (const config of Array_.toArray(buff.effects)) {
      if (
        (isFinal === undefined || isFinal === this.isTrulyFinalBonus(config)) &&
        isApplicableEffect(config, this.info, support.inputs, support.fromSelf)
      ) {
        const bonus = this.getBareBonus(
          config,
          support,
          !Array.isArray(config.targets) && config.targets.module === ECalcStatModule.ATTR
        );

        this.applyBonus(
          bonus,
          config.targets,
          {
            description,
            unstackableId: buff.unstackableId,
            inputs: support.inputs,
          },
          result
        );
      }
    }
    return result;
  }
}
