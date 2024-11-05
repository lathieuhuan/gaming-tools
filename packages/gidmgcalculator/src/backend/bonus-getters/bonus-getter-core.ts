import type { EntityBonusBasedOn, EntityBonusCore, EntityBonusStack } from "../types";
import type { TotalAttributeControl } from "../controls";
import type { BareBonus } from "./bonus-getters.types";
import { CalculationInfo, CharacterCalc, EntityCalc, GeneralCalc } from "../utils";

export class BonusGetterCore {
  constructor(protected totalAttrCtrl: TotalAttributeControl, protected info: CalculationInfo) {}

  protected getBasedOn(basedOn: EntityBonusBasedOn, inputs: number[], fromSelf: boolean) {
    const { field, alterIndex = 0, baseline = 0 } = typeof basedOn === "string" ? { field: basedOn } : basedOn;
    const basedOnValue = fromSelf ? this.totalAttrCtrl.getTotal(field) : inputs[alterIndex] ?? 1;
    return {
      basedOnField: field,
      basedOnValue: Math.max(basedOnValue - baseline, 0),
    };
  }

  protected getStackValue(stack: EntityBonusStack | undefined, inputs: number[], fromSelf: boolean): number {
    if (!stack) {
      return 1;
    }
    const { char, appChar, partyData } = this.info;
    const partyDependentStackTypes: EntityBonusStack["type"][] = ["ELEMENT", "ENERGY", "NATION", "RESOLVE", "MIX"];

    if (partyDependentStackTypes.includes(stack.type) && !partyData.length) {
      return 0;
    }
    let result = 0;

    switch (stack.type) {
      case "INPUT": {
        const finalIndex = stack.alterIndex !== undefined && !fromSelf ? stack.alterIndex : stack.index ?? 0;
        let input = 0;

        if (typeof finalIndex === "number") {
          input = inputs[finalIndex] ?? 0;

          if (stack.doubledAt !== undefined && inputs[stack.doubledAt]) {
            input *= 2;
          }
        } else {
          input = finalIndex.reduce((total, { value, ratio = 1 }) => total + (inputs[value] ?? 0) * ratio, 0);
        }

        if (stack.capacity) {
          const { value, extra } = stack.capacity;
          input = value - input;
          if (EntityCalc.isApplicableEffect(extra, this.info, inputs, fromSelf)) input += extra.value;
          input = Math.max(input, 0);
        }
        result = input;
        break;
      }
      case "ELEMENT": {
        const { element } = stack;
        const elementsCount = GeneralCalc.countElements(partyData);

        switch (element) {
          case "different":
            elementsCount.forEach((type, value) => {
              result += type !== appChar.vision ? value : 0;
            });
            break;
          case "same_excluded":
            elementsCount.forEach((type, value) => {
              result += type === appChar.vision ? value : 0;
            });
            break;
          case "same_included":
            elementsCount.forEach((type, value) => {
              result += type === appChar.vision ? value : 0;
            });
            result++;
            break;
          default:
            elementsCount.forEach((type, value) => {
              result += type === element ? value : 0;
            });
            if (appChar.vision === element) result++;
        }
        break;
      }
      case "ENERGY": {
        result = appChar.EBcost;

        if (stack.scope === "PARTY") {
          result += partyData.reduce((result, data) => result + (data?.EBcost ?? 0), 0);
        }
        break;
      }
      case "NATION": {
        if (stack.nation === "liyue") {
          result = partyData.reduce(
            (result, data) => result + (data?.nation === "liyue" ? 1 : 0),
            appChar.nation === "liyue" ? 1 : 0
          );
        } else {
          result = partyData.reduce((total, teammate) => total + (teammate?.nation === appChar.nation ? 1 : 0), 0);

          if (stack.nation === "different") {
            result = partyData.filter(Boolean).length - result;
          }
        }
        break;
      }
      case "RESOLVE": {
        let [totalEnergy = 0, electroEnergy = 0] = inputs;
        if (char.cons >= 1 && electroEnergy <= totalEnergy) {
          totalEnergy += electroEnergy * 0.8 + (totalEnergy - electroEnergy) * 0.2;
        }
        const level = CharacterCalc.getFinalTalentLv({
          talentType: "EB",
          char: char,
          appChar,
          partyData,
        });
        const stackPerEnergy = Math.min(Math.ceil(14.5 + level * 0.5), 20);
        const stacks = Math.round(totalEnergy * stackPerEnergy) / 100;
        // const countResolve = (energyCost: number) => Math.round(energyCost * stackPerEnergy) / 100;

        result = Math.min(stacks, 60);
        break;
      }
      case "MIX": {
        if (appChar.nation === "natlan") result += 1;

        for (const teammate of partyData) {
          if (teammate && (teammate.nation === "natlan" || teammate.vision !== appChar.vision)) {
            result += 1;
          }
        }
        break;
      }
    }

    if (stack.baseline) {
      if (result <= stack.baseline) return 0;
      result -= stack.baseline;
    }
    if (stack.extra && EntityCalc.isApplicableEffect(stack.extra, this.info, inputs, fromSelf)) {
      result += stack.extra.value;
    }
    if (stack.max) {
      const max = EntityCalc.getMax(stack.max, this.info, inputs, fromSelf);
      if (result > max) result = max;
    }

    return Math.max(result, 0);
  }

  getBonus(config: EntityBonusCore, inputs: number[], fromSelf: boolean, initialValue = 0): BareBonus {
    let isStable = true;

    // ========== ADD PRE-EXTRA ==========
    if (typeof config.preExtra === "number") {
      initialValue += config.preExtra;
    } //
    else if (config.preExtra && EntityCalc.isApplicableEffect(config.preExtra, this.info, inputs, fromSelf)) {
      const preExtra = this.getBonus(config.preExtra, inputs, fromSelf);

      if (preExtra) {
        initialValue += preExtra.value;
        // if preExtra is not stable, this whole bonus is not stable
        if (!preExtra.isStable) isStable = false;
      }
    }

    // ========== APPLY BASED ON ==========
    if (config.basedOn) {
      const { basedOnField, basedOnValue } = this.getBasedOn(config.basedOn, inputs, fromSelf);

      initialValue *= basedOnValue;
      if (basedOnField !== "base_atk") isStable = false;
    }

    // ========== APPLY STACKS ==========
    initialValue *= this.getStackValue(config.stacks, inputs, fromSelf);

    return {
      id: config.id,
      value: initialValue,
      isStable,
    };
  }
}
