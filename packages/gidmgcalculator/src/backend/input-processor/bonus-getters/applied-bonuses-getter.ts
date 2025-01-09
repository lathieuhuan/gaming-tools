import type {
  AppliedAttributeBonus,
  AppliedBonuses,
  BareBonus,
  EntityBonusBasedOn,
  EntityBonusCore,
  EntityBonusTargets,
  EntityBuff,
} from "@Src/backend/types";

import Array_ from "@Src/utils/array-utils";
import { ELEMENT_TYPES } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal";
import { isApplicableEffect } from "@Src/backend/calculation-utils/isApplicableEffect";
import { BareBonusGetter, type GetBareBonusSupportInfo } from "./bare-bonus-getter";

type ApplyBonusSupportInfo = {
  description: string;
  inputs: number[];
  unstackableId?: string;
};

export class AppliedBonusesGetter extends BareBonusGetter {
  private modStackingCtrl = new ModifierStackingControl();

  private isFinalBonus = (basedOn?: EntityBonusBasedOn) => {
    if (basedOn) {
      const field = typeof basedOn === "string" ? basedOn : basedOn.field;
      return field !== "base_atk";
    }
    return false;
  };

  private isTrulyFinalBonus = (bonus: EntityBonusCore) => {
    return (
      this.isFinalBonus(bonus.basedOn) ||
      (typeof bonus.preExtra === "object" && this.isFinalBonus(bonus.preExtra.basedOn)) ||
      (typeof bonus.sufExtra === "object" && this.isFinalBonus(bonus.sufExtra.basedOn))
    );
  };

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

    for (const target of Array_.toArray(targets)) {
      const isStackable = this.modStackingCtrl.isStackable({ trackId: support.unstackableId, paths: target.path });
      if (!isStackable) continue;

      switch (target.module) {
        case "ATTR": {
          for (const targetPath of Array_.toArray(target.path)) {
            let toStat: AppliedAttributeBonus["toStat"];

            switch (targetPath) {
              case "INP_ELMT": {
                const elmtIndex = support.inputs[target.inpIndex ?? 0];
                toStat = ELEMENT_TYPES[elmtIndex];
                break;
              }
              case "OWN_ELMT":
                toStat = this.characterData.appCharacter.vision;
                break;
              default:
                toStat = targetPath;
            }

            result.attrBonuses.push({
              ...bonus,
              toStat,
              description: support.description,
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
              description: support.description,
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
              description: support.description,
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
        isApplicableEffect(config, this.characterData, support.inputs, support.fromSelf)
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

type StackableCheckCondition = {
  trackId?: string;
  paths: string | string[];
};

export class ModifierStackingControl {
  private usedMods: NonNullable<StackableCheckCondition>[] = [];

  isStackable = (condition: StackableCheckCondition) => {
    if (condition.trackId) {
      const isUsed = this.usedMods.some((usedMod) => {
        if (condition.trackId === usedMod.trackId && typeof condition.paths === typeof usedMod.paths) {
          if (Array.isArray(condition.paths)) {
            return (
              condition.paths.length === usedMod.paths.length &&
              condition.paths.every((target, i) => target === usedMod.paths[i])
            );
          }
          return condition.paths === usedMod.paths;
        }
        return false;
      });

      if (isUsed) return false;

      this.usedMods.push(condition);
    }
    return true;
  };
}
