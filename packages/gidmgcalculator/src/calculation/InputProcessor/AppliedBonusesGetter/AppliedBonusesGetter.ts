import type { CalcTeamData } from "@Src/calculation/utils/CalcTeamData";
import type {
  AppliedAttributeBonus,
  AppliedBonuses,
  BareBonus,
  EntityBonusBasedOn,
  EntityBonusEffect,
  EntityBonusTargets,
  EntityBuff,
} from "@Src/calculation/types";

import { ELEMENT_TYPES } from "@Src/calculation/constants";
import { ECalcStatModule } from "@Src/calculation/constants/internal";
import Array_ from "@Src/utils/array-utils";
import { BareBonusGetter, BonusGetterSupport } from "../BareBonusGetter";

type ApplyBonusSupportInfo = {
  description: string;
  inputs: number[];
  unstackableId?: string;
};

type StackableCheckCondition = {
  trackId?: string;
  module: string | string[];
  path: string | string[];
};

export class AppliedBonusesGetter<T extends CalcTeamData = CalcTeamData> extends BareBonusGetter<T> {
  private usedMods: NonNullable<StackableCheckCondition>[] = [];

  protected isStackable = (condition: StackableCheckCondition) => {
    if (condition.trackId) {
      const isUsed = this.usedMods.some((usedMod) => {
        return (
          condition.trackId === usedMod.trackId &&
          Array_.isEqual(Array_.toArray(condition.module), Array_.toArray(usedMod.module)) &&
          Array_.isEqual(Array_.toArray(condition.path), Array_.toArray(usedMod.path))
        );
      });

      if (isUsed) return false;

      this.usedMods.push(condition);
    }
    return true;
  };

  private isFinalEffect = (basedOn?: EntityBonusBasedOn) => {
    if (basedOn) {
      const field = typeof basedOn === "string" ? basedOn : basedOn.field;
      return field !== "base_atk";
    }
    return false;
  };

  private isTrulyFinalEffect = (bonus: EntityBonusEffect) => {
    return (
      this.isFinalEffect(bonus.basedOn) ||
      (typeof bonus.preExtra === "object" && this.isFinalEffect(bonus.preExtra.basedOn)) ||
      (typeof bonus.sufExtra === "object" && this.isFinalEffect(bonus.sufExtra.basedOn))
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
      if (!this.isStackable({ trackId: support.unstackableId, ...target })) {
        continue;
      }

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
                toStat = this.teamData.activeAppMember.vision;
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
    support: Omit<BonusGetterSupport, "basedOnStable">,
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
        (isFinal === undefined || isFinal === this.isTrulyFinalEffect(config)) &&
        this.teamData.isApplicableEffect(config, support.inputs, this.fromSelf)
      ) {
        const bonus = this.getBareBonus(config, {
          ...support,
          basedOnStable: !Array.isArray(config.targets) && config.targets.module === ECalcStatModule.ATTR,
        });

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
