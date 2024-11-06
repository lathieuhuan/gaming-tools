import type { TotalAttributeControl } from "../controls";
import type {
  EffectExtra,
  EffectMax,
  EntityBonusBasedOn,
  EntityBonusCore,
  EntityBonusStack,
  EntityBonusValueByOption,
} from "../types";
import type { BareBonus } from "./modifier-getters.types";

import { toArray } from "@Src/utils";
import { type CalculationInfo, CharacterCalc, GeneralCalc } from "../utils";
import { ModifierGetterCore } from "./modifier-getter-core";

export class BonusGetter extends ModifierGetterCore {
  constructor(protected info: CalculationInfo, private totalAttrCtrl: TotalAttributeControl) {
    super(info);
  }

  // ========== UTILS ==========

  protected scaleRefi(base: number, refi: number, increment = base / 3) {
    return base + increment * refi;
  }

  protected getBonusValueByOption(config: EntityBonusValueByOption, inputs: number[]) {
    const { appChar, partyData } = this.info;
    const { optIndex = 0 } = config;
    const indexConfig =
      typeof optIndex === "number"
        ? ({ source: "INPUT", inpIndex: optIndex } satisfies EntityBonusValueByOption["optIndex"])
        : optIndex;
    let indexValue = -1;

    switch (indexConfig.source) {
      case "INPUT":
        indexValue += inputs[indexConfig.inpIndex];
        break;
      case "ELEMENT": {
        const { element } = indexConfig;
        const elementCount = GeneralCalc.countElements(partyData, appChar);

        switch (element) {
          case "various_types":
            indexValue += elementCount.keys.length;
            break;
          case "different":
            elementCount.forEach((elementType) => {
              if (elementType !== appChar.vision) indexValue++;
            });
            break;
          default:
            if (typeof element === "string") {
              indexValue += elementCount.get(element);
            } else if (indexConfig.distinct) {
              indexValue += element.reduce((total, elementType) => total + (elementCount.has(elementType) ? 1 : 0), 0);
            } else {
              indexValue += element.reduce((total, type) => total + elementCount.get(type), 0);
            }
        }
        break;
      }
      case "LEVEL": {
        indexValue += CharacterCalc.getFinalTalentLv({
          talentType: indexConfig.talent,
          ...this.info,
        });
        break;
      }
    }
    return indexValue;
  }

  protected getExtra(extras: EffectExtra | EffectExtra[] | undefined, inputs: number[], fromSelf = true) {
    if (!extras) return 0;
    let result = 0;

    for (const extra of toArray(extras)) {
      if (this.isApplicableEffect(extra, inputs, fromSelf)) {
        result += extra.value;
      }
    }
    return result;
  }

  private getBasedOn(config: EntityBonusBasedOn, inputs: number[], fromSelf = true) {
    const { field, alterIndex = 0, baseline = 0 } = typeof config === "string" ? { field: config } : config;
    const basedOnValue = fromSelf ? this.totalAttrCtrl.getTotal(field) : inputs[alterIndex] ?? 1;
    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
    };
  }

  protected applyMax(value: number, config: EffectMax | undefined, inputs: number[], fromSelf = true, refi = 0) {
    if (typeof config === "number") {
      return Math.min(value, config);
    } //
    else if (config) {
      let finalMax = config.value;

      if (config.basedOn) {
        finalMax *= this.getBasedOn(config.basedOn, inputs, fromSelf).value;
      }
      finalMax += this.getExtra(config.extras, inputs, fromSelf);
      finalMax = this.scaleRefi(finalMax, refi, config.incre);

      return Math.min(value, finalMax);
    }
    return value;
  }

  // ========== MAIN ==========

  getIntialBonusValue(config: EntityBonusCore["value"], inputs: number[], fromSelf = true) {
    if (typeof config === "number") {
      return config;
    }
    const { preOptions, options } = config;
    let index = -1;

    /** Navia */
    if (preOptions && !inputs[1]) {
      const preIndex = preOptions[inputs[0]];
      index += preIndex ?? preOptions[preOptions.length - 1];
    } else {
      index = this.getBonusValueByOption(config, inputs);
    }

    index += this.getExtra(config.extra, inputs, fromSelf);
    index = this.applyMax(index, config.max, inputs, fromSelf);

    return options[index] ?? (index > 0 ? options[options.length - 1] : 0);
  }

  private applyExtra(
    bonus: BareBonus,
    config: number | EntityBonusCore | undefined,
    inputs: number[],
    fromSelf = true,
    refi = 0
  ) {
    if (typeof config === "number") {
      bonus.value += this.scaleRefi(config, refi);
    } //
    else if (config && this.isApplicableEffect(config, inputs, fromSelf)) {
      const extra = this.getBonus(config, inputs, fromSelf);

      if (extra) {
        bonus.value += extra.value;
        // if extra is not stable, this whole bonus is not stable
        if (!extra.isStable) bonus.isStable = false;
      }
    }
  }

  protected getStackValue(stack: EntityBonusStack | undefined, inputs: number[], fromSelf = true): number {
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
          if (this.isApplicableEffect(extra, inputs, fromSelf)) input += extra.value;
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
    if (stack.extra && this.isApplicableEffect(stack.extra, inputs, fromSelf)) {
      result += stack.extra.value;
    }
    result = this.applyMax(result, stack.max, inputs, fromSelf);

    return Math.max(result, 0);
  }

  getBonus(config: EntityBonusCore, inputs: number[], fromSelf = true, refi = 0): BareBonus {
    const initial: BareBonus = {
      id: config.id,
      value: this.getIntialBonusValue(config.value, inputs, fromSelf),
      isStable: true,
    };

    initial.value = this.scaleRefi(initial.value, refi, config.incre);

    initial.value *= CharacterCalc.getLevelScale(config.lvScale, this.info, inputs, fromSelf);

    this.applyExtra(initial, config.preExtra, inputs, fromSelf);

    if (config.basedOn) {
      const basedOn = this.getBasedOn(config.basedOn, inputs, fromSelf);

      initial.value *= basedOn.value;
      if (basedOn.field !== "base_atk") initial.isStable = false;
    }

    initial.value *= this.getStackValue(config.stacks, inputs, fromSelf);

    this.applyExtra(initial, config.sufExtra, inputs, fromSelf);

    initial.value = this.applyMax(initial.value, config.max, inputs, fromSelf);

    return initial;
  }
}
