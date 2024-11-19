import type { PartiallyOptional } from "rond";
import type { TotalAttributeControl } from "../controls";
import type {
  BareBonus,
  CalculationInfo,
  EffectExtra,
  EffectMax,
  EntityBonusBasedOn,
  EntityBonusCore,
  EntityBonusStack,
  EntityBonusValueByOption,
} from "../types";

import Array_ from "@Src/utils/array-utils";
import { CharacterCalc, GeneralCalc } from "../common-utils";
import { isApplicableEffect } from "./isApplicableEffect";

export type GetBareBonusSupportInfo = {
  inputs: number[];
  fromSelf: boolean;
  refi?: number;
};

type InternalSupportInfo = GetBareBonusSupportInfo & {
  basedOnStable?: boolean;
};

export class BareBonusGetter {
  constructor(protected info: CalculationInfo, protected totalAttrCtrl?: TotalAttributeControl) {}

  // ========== UTILS ==========

  protected scaleRefi(base: number, refi = 0, increment = base / 3) {
    return base + increment * refi;
  }

  protected getIndexOfBonusValue(config: EntityBonusValueByOption, inputs: number[]) {
    const { appChar, partyData } = this.info;
    const { optIndex = 0 } = config;
    const elmtCount = GeneralCalc.countElements(partyData, appChar);
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
        const { elements } = indexConfig;

        if (elements) {
          elmtCount.forEach((elementType) => {
            if (elements.includes(elementType)) indexValue++;
          });
        } else {
          indexValue += elmtCount.keys.length;
        }
        break;
      }
      case "MEMBER": {
        switch (indexConfig.element) {
          case "DIFFERENT":
            elmtCount.forEach((elementType) => {
              if (elementType !== appChar.vision) indexValue++;
            });
            break;
          default:
            if (typeof indexConfig.element === "string") {
              indexValue += elmtCount.get(indexConfig.element);
            } else {
              indexValue += indexConfig.element.reduce((total, type) => total + elmtCount.get(type), 0);
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

  protected getExtra(extras: EffectExtra | EffectExtra[] | undefined, support: InternalSupportInfo) {
    if (!extras) return 0;
    let result = 0;

    for (const extra of Array_.toArray(extras)) {
      if (isApplicableEffect(extra, this.info, support.inputs, support.fromSelf)) {
        result += extra.value;
      }
    }
    return result;
  }

  protected getBasedOn(config: EntityBonusBasedOn, support: InternalSupportInfo) {
    const { field, altIndex = 0, baseline = 0 } = typeof config === "string" ? { field: config } : config;
    let basedOnValue = 1;

    if (support.fromSelf) {
      if (this.totalAttrCtrl) {
        basedOnValue = support.basedOnStable
          ? this.totalAttrCtrl.getTotalStable(field)
          : this.totalAttrCtrl.getTotal(field);
      }
    } else {
      basedOnValue = support.inputs[altIndex] ?? 1;
    }
    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
    };
  }

  protected applyMax(value: number, config: EffectMax | undefined, support: InternalSupportInfo) {
    if (typeof config === "number") {
      return Math.min(value, config);
    } //
    else if (config) {
      let finalMax = config.value;

      if (config.basedOn) {
        finalMax *= this.getBasedOn(config.basedOn, support).value;
      }
      finalMax += this.getExtra(config.extras, support);
      finalMax = this.scaleRefi(finalMax, support.refi, config.incre);

      return Math.min(value, finalMax);
    }
    return value;
  }

  // ========== MAIN ==========

  getIntialBonusValue(config: EntityBonusCore["value"], support: InternalSupportInfo) {
    const { inputs } = support;

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
      index = this.getIndexOfBonusValue(config, inputs);
    }

    index += this.getExtra(config.extra, support);
    index = this.applyMax(index, config.max, support);

    return options[index] ?? (index > 0 ? options[options.length - 1] : 0);
  }

  protected applyExtra(bonus: BareBonus, config: number | EntityBonusCore | undefined, support: InternalSupportInfo) {
    if (typeof config === "number") {
      bonus.value += this.scaleRefi(config, support.refi);
    } //
    else if (config && isApplicableEffect(config, this.info, support.inputs, support.fromSelf)) {
      const extra = this.getBareBonus(config, support);

      if (extra) {
        bonus.value += extra.value;
        // if extra is not stable, this whole bonus is not stable
        if (!extra.isStable) bonus.isStable = false;
      }
    }
  }

  protected getStackValue(stack: EntityBonusStack | undefined, support: InternalSupportInfo): number {
    if (!stack) {
      return 1;
    }
    const { inputs, fromSelf } = support;
    const { char, appChar, partyData } = this.info;
    const partyDependentStackTypes: EntityBonusStack["type"][] = ["ELEMENT", "ENERGY", "NATION", "RESOLVE", "MIX"];

    if (partyDependentStackTypes.includes(stack.type) && !partyData.length) {
      return 0;
    }
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

        if (stack.capacity) {
          const { value, extra } = stack.capacity;
          input = value - input;
          if (isApplicableEffect(extra, this.info, inputs, fromSelf)) input += extra.value;
          input = Math.max(input, 0);
        }
        result = input;
        break;
      }
      case "ELEMENT": {
        const { element } = stack;
        const elmtCount = GeneralCalc.countElements(partyData);

        switch (element) {
          case "DIFFERENT":
            elmtCount.forEach((type, value) => {
              result += type !== appChar.vision ? value : 0;
            });
            break;
          case "SAME_EXCLUDED":
            elmtCount.forEach((type, value) => {
              result += type === appChar.vision ? value : 0;
            });
            break;
          case "SAME_INCLUDED":
            elmtCount.forEach((type, value) => {
              result += type === appChar.vision ? value : 0;
            });
            result++;
            break;
          default:
            elmtCount.forEach((type, value) => {
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
        if (stack.nation === "LIYUE") {
          result = partyData.reduce(
            (result, data) => result + (data?.nation === "liyue" ? 1 : 0),
            appChar.nation === "liyue" ? 1 : 0
          );
        } else {
          result = partyData.reduce((total, teammate) => total + (teammate?.nation === appChar.nation ? 1 : 0), 0);

          if (stack.nation === "DIFFERENT") {
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
    if (stack.extra && isApplicableEffect(stack.extra, this.info, inputs, fromSelf)) {
      result += stack.extra.value;
    }
    result = this.applyMax(result, stack.max, support);

    return Math.max(result, 0);
  }

  getBareBonus(
    config: EntityBonusCore,
    { inputs, fromSelf = true, refi = 0 }: PartiallyOptional<GetBareBonusSupportInfo, "fromSelf">,
    basedOnStable = false
  ): BareBonus {
    const support: InternalSupportInfo = {
      inputs,
      fromSelf,
      refi,
      basedOnStable,
    };
    const initial: BareBonus = {
      id: config.id,
      value: this.getIntialBonusValue(config.value, support),
      isStable: true,
    };

    initial.value = this.scaleRefi(initial.value, refi, config.incre);

    initial.value *= CharacterCalc.getLevelScale(config.lvScale, this.info, inputs, fromSelf);

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
  }
}
