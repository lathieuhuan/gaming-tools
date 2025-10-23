import type { CalcTeamData } from "@/calculation/CalcTeamData";
import type {
  AppliedAttributeBonus,
  AppliedBonuses,
  BareBonus,
  EntityBonusBasedOn,
  EntityBonusEffect,
  EntityBonusTargets,
  EntityBuff,
} from "@/calculation/types";

import { ELEMENT_TYPES } from "@/calculation/constants";
import { ECalcStatModule } from "@/calculation/constants/internal";
import Array_ from "@/utils/Array";
import { BareBonusGetter, BonusGetterSupport } from "../BareBonusGetter";

type ApplyBonusSupportInfo = {
  description: string;
  inputs: number[];
  monoId?: string;
};

type StackableCheckCondition = {
  trackId?: string;
  targetId: string;
};

export class AppliedBonusesGetter<T extends CalcTeamData = CalcTeamData> extends BareBonusGetter<T> {
  private usedMods: NonNullable<StackableCheckCondition>[] = [];

  protected isStackable = (condition: StackableCheckCondition) => {
    if (condition.trackId) {
      const isUsed = this.usedMods.some((usedMod) => {
        return condition.trackId === usedMod.trackId && condition.targetId === usedMod.targetId;
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

            if (!this.isStackable({ trackId: support.monoId, targetId: toStat })) {
              continue;
            }

            result.attrBonuses.push({
              ...bonus,
              toStat,
              description: support.description,
            });
          }
          break;
        }
        default:
          for (const module of Array_.toArray(target.module)) {
            if (!this.isStackable({ trackId: support.monoId, targetId: `${module}/${target.path}` })) {
              continue;
            }

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
    buff: Pick<EntityBuff, "effects">,
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
        this.teamData.isApplicableEffect(config, support.inputs, support.fromSelf)
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
            monoId: config.monoId,
            inputs: support.inputs,
          },
          result
        );
      }
    }
    return result;
  }
}
