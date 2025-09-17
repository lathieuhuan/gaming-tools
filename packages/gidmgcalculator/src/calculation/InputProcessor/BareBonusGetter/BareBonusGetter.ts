import type { BareBonus, EntityBonusEffect, EntityBonusStack } from "@/calculation/types";
import type { BonusGetterSupport } from "./BareBonusGetter.types";

import { CalcTeamData } from "@/calculation/CalcTeamData";
import { InitialBonusGetter } from "./InitialBonusGetter";

export class BareBonusGetter<T extends CalcTeamData = CalcTeamData> extends InitialBonusGetter<T> {
  //

  protected applyExtra = (
    bonus: BareBonus,
    config: number | EntityBonusEffect | undefined,
    support: BonusGetterSupport
  ) => {
    if (typeof config === "number") {
      bonus.value += this.scaleRefi(config, support.refi);
    } //
    else if (config && this.teamData.isApplicableEffect(config, support.inputs, support.fromSelf)) {
      const extra = this.getBareBonus(config, support);

      if (extra) {
        bonus.value += extra.value;
        // if extra is not stable, this whole bonus is not stable
        if (!extra.isStable) bonus.isStable = false;
      }
    }
  };

  protected getStackValue = (stack: EntityBonusStack | undefined, support: BonusGetterSupport): number => {
    if (!stack) {
      return 1;
    }
    const { teamData } = this;
    const partyDependentStackTypes: EntityBonusStack["type"][] = ["MEMBER", "ENERGY", "NATION", "RESOLVE", "MIX"];

    if (partyDependentStackTypes.includes(stack.type) && !teamData.teammates.length) {
      return 0;
    }

    const { inputs, fromSelf } = support;
    const { activeAppMember } = teamData;
    let result = 0;

    switch (stack.type) {
      case "INPUT": {
        const finalIndex = stack.altIndex !== undefined && !fromSelf ? stack.altIndex : stack.index ?? 0;
        let input = 0;

        if (typeof finalIndex === "number") {
          input = inputs[finalIndex] ?? 0;

          if (stack.doubledAt !== undefined && inputs[stack.doubledAt]) {
            input *= 2;
          }
        } else {
          input = finalIndex.reduce((total, { value, ratio = 1 }) => total + (inputs[value] ?? 0) * ratio, 0);
        }

        result = input;
        break;
      }
      case "MEMBER": {
        const { element } = stack;
        const { elmtCount, teammateElmtCount } = teamData;

        switch (element) {
          case "DIFFERENT":
            teammateElmtCount.forEach((type, value) => {
              result += type !== activeAppMember.vision ? value : 0;
            });
            break;
          case "SAME_EXCLUDED":
            teammateElmtCount.forEach((type, value) => {
              result += type === activeAppMember.vision ? value : 0;
            });
            break;
          case "SAME_INCLUDED":
            elmtCount.forEach((type, value) => {
              result += type === activeAppMember.vision ? value : 0;
            });
            break;
          default:
            elmtCount.forEach((type, value) => {
              result += type === element ? value : 0;
            });
        }
        break;
      }
      case "ENERGY": {
        result = activeAppMember.EBcost;

        if (stack.scope === "PARTY") {
          teamData.forEachAppTeammate((data) => (result += data.EBcost));
        }
        break;
      }
      case "NATION": {
        switch (stack.nation) {
          case "LIYUE":
            result = activeAppMember.nation === "liyue" ? 1 : 0;
            teamData.forEachAppTeammate((data) => (result += data.nation === "liyue" ? 1 : 0));
            break;
          case "SAME_EXCLUDED":
            teamData.forEachAppTeammate((data) => (result += data.nation === activeAppMember.nation ? 1 : 0));
            break;
          case "DIFFERENT":
            teamData.forEachAppTeammate((data) => (result += data.nation !== activeAppMember.nation ? 1 : 0));
            break;
        }
        break;
      }
      case "RESOLVE": {
        let [totalEnergy = 0, electroEnergy = 0] = inputs;
        if (teamData.activeMember.cons >= 1 && electroEnergy <= totalEnergy) {
          totalEnergy += electroEnergy * 0.8 + (totalEnergy - electroEnergy) * 0.2;
        }
        const level = teamData.getFinalTalentLv("EB");
        const stackPerEnergy = Math.min(Math.ceil(14.5 + level * 0.5), 20);
        const stacks = Math.round(totalEnergy * stackPerEnergy) / 100;
        // const countResolve = (energyCost: number) => Math.round(energyCost * stackPerEnergy) / 100;

        result = Math.min(stacks, 60);
        break;
      }
      case "MIX": {
        result = activeAppMember.nation === "natlan" ? 1 : 0;

        teamData.forEachAppTeammate((data) => {
          result += data.nation === "natlan" || data.vision !== activeAppMember.vision ? 1 : 0;
        });
        break;
      }
    }

    if (stack.capacity) {
      const capacityExtra = stack.capacity.extra;
      const capacity =
        stack.capacity.value +
        (teamData.isApplicableEffect(capacityExtra, inputs, fromSelf) ? capacityExtra.value : 0);

      result = Math.max(capacity - result, 0);
    }
    if (stack.baseline) {
      if (result <= stack.baseline) return 0;
      result -= stack.baseline;
    }
    if (stack.extra && teamData.isApplicableEffect(stack.extra, inputs, fromSelf)) {
      result += stack.extra.value;
    }

    // check before applyMax because max stack in number does not auto scale with refi
    result = typeof stack.max === "number" ? Math.min(result, stack.max) : this.applyMax(result, stack.max, support);

    return Math.max(result, 0);
  };

  protected getBareBonus = (
    config: EntityBonusEffect,
    { inputs, fromSelf, refi = 0, basedOnStable = false }: BonusGetterSupport
  ): BareBonus => {
    const support: BonusGetterSupport = {
      inputs,
      fromSelf,
      refi,
      basedOnStable,
    };
    const initial: BareBonus = {
      id: config.id,
      value: this.getInitialValue(config.value, support),
      isStable: true,
    };

    initial.value = this.scaleRefi(initial.value, refi, config.incre);

    initial.value *= this.getLevelScale(config.lvScale, support);

    this.applyExtra(initial, config.preExtra, support);

    if (config.basedOn) {
      const basedOn = this.getBasedOn(config.basedOn, support);

      initial.value *= basedOn.value;
      if (basedOn.field !== "base_atk") initial.isStable = false;
    }

    initial.value *= this.getStackValue(config.stacks, support);

    this.applyExtra(initial, config.sufExtra, support);

    initial.value = this.applyMax(initial.value, config.max, support);

    return initial;
  };
}
