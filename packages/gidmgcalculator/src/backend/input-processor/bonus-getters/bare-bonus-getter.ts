import type { PartiallyOptional } from "rond";
import type {
  BareBonus,
  CharacterEffectLevelIncrement,
  EffectExtra,
  EffectMax,
  EntityBonusBasedOn,
  EntityBonusCore,
  EntityBonusStack,
  EntityBonusValueByOption,
} from "@Src/backend/types";
import type { TotalAttributeControl } from "../stat-controls";

import Array_ from "@Src/utils/array-utils";
import { isApplicableEffect, type CharacterData } from "@Src/backend/common-utils";

export type GetBareBonusSupportInfo = {
  inputs: number[];
  fromSelf: boolean;
  refi?: number;
};

type InternalSupportInfo = GetBareBonusSupportInfo & {
  basedOnStable?: boolean;
};

export class BareBonusGetter<T extends CharacterData = CharacterData> {
  constructor(protected characterData: T, protected totalAttrCtrl?: TotalAttributeControl) {}

  updateTotalAttrCtrl(totalAttrCtrl: TotalAttributeControl) {
    this.totalAttrCtrl = totalAttrCtrl;
  }

  // ========== UTILS ==========

  protected scaleRefi(base: number, refi = 0, increment = base / 3) {
    return base + increment * refi;
  }

  protected getLvIncre(incre: CharacterEffectLevelIncrement | undefined, support: InternalSupportInfo) {
    if (incre) {
      const { talent, value, altIndex = 0 } = incre;
      const level = support.fromSelf ? this.characterData.getFinalTalentLv(talent) : support.inputs[altIndex] ?? 0;
      return level * value;
    }
    return 0;
  }

  /**
   * @param inputs used when optIndex is number or has INPUT source
   */
  protected getIndexOfBonusValue = (config: Pick<EntityBonusValueByOption, "optIndex">, inputs: number[] = []) => {
    const { characterData } = this;
    const { optIndex = 0 } = config;
    const elmtCount = characterData.allElmtCount;
    const indexConfig =
      typeof optIndex === "number"
        ? ({ source: "INPUT", inpIndex: optIndex } satisfies EntityBonusValueByOption["optIndex"])
        : optIndex;
    let indexValue = -1;

    switch (indexConfig.source) {
      case "INPUT":
        indexValue += inputs[indexConfig.inpIndex] ?? 0;
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
              if (elementType !== characterData.appCharacter.vision) indexValue++;
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
        indexValue += characterData.getFinalTalentLv(indexConfig.talent);
        break;
      }
    }
    return indexValue;
  };

  protected getExtra = (
    extras: EffectExtra | EffectExtra[] | undefined,
    support: Pick<InternalSupportInfo, "inputs" | "fromSelf">
  ) => {
    if (!extras) return 0;
    let result = 0;

    for (const extra of Array_.toArray(extras)) {
      if (isApplicableEffect(extra, this.characterData, support.inputs, support.fromSelf)) {
        result += extra.value;
      }
    }
    return result;
  };

  protected getBasedOn = (config: EntityBonusBasedOn, support: Omit<InternalSupportInfo, "refi">) => {
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
  };

  /**
   * @param support must have when config is EffectDynamicMax
   */
  protected applyMax = (value: number, config: EffectMax | undefined, support?: InternalSupportInfo) => {
    if (typeof config === "number") {
      return Math.min(value, this.scaleRefi(config, support?.refi));
    } //
    else if (config && support) {
      let finalMax = config.value;

      if (config.basedOn) {
        finalMax *= this.getBasedOn(config.basedOn, support).value;
      }
      finalMax += this.getExtra(config.extras, support);
      finalMax = this.scaleRefi(finalMax, support.refi, config.incre);
      finalMax += this.getLvIncre(config.lvIncre, support);

      return Math.min(value, finalMax);
    }
    return value;
  };

  // ========== MAIN ==========

  getIntialBonusValue = (config: EntityBonusCore["value"], support: InternalSupportInfo) => {
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
  };

  protected applyExtra = (
    bonus: BareBonus,
    config: number | EntityBonusCore | undefined,
    support: InternalSupportInfo
  ) => {
    if (typeof config === "number") {
      bonus.value += this.scaleRefi(config, support.refi);
    } //
    else if (config && isApplicableEffect(config, this.characterData, support.inputs, support.fromSelf)) {
      const extra = this.getBareBonus(config, support);

      if (extra) {
        bonus.value += extra.value;
        // if extra is not stable, this whole bonus is not stable
        if (!extra.isStable) bonus.isStable = false;
      }
    }
  };

  protected getStackValue = (stack: EntityBonusStack | undefined, support: InternalSupportInfo): number => {
    if (!stack) {
      return 1;
    }
    const { characterData } = this;
    const partyDependentStackTypes: EntityBonusStack["type"][] = ["MEMBER", "ENERGY", "NATION", "RESOLVE", "MIX"];

    if (partyDependentStackTypes.includes(stack.type) && !characterData.party.length) {
      return 0;
    }

    const { inputs, fromSelf } = support;
    const { appCharacter } = characterData;
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
        const elmtCount = characterData.elmtCount;

        switch (element) {
          case "DIFFERENT":
            elmtCount.forEach((type, value) => {
              result += type !== appCharacter.vision ? value : 0;
            });
            break;
          case "SAME_EXCLUDED":
            elmtCount.forEach((type, value) => {
              result += type === appCharacter.vision ? value : 0;
            });
            break;
          case "SAME_INCLUDED":
            elmtCount.forEach((type, value) => {
              result += type === appCharacter.vision ? value : 0;
            });
            result++;
            break;
          default:
            elmtCount.forEach((type, value) => {
              result += type === element ? value : 0;
            });
            if (appCharacter.vision === element) result++;
        }
        break;
      }
      case "ENERGY": {
        result = appCharacter.EBcost;

        if (stack.scope === "PARTY") {
          characterData.forEachTeammate((data) => (result += data.EBcost));
        }
        break;
      }
      case "NATION": {
        switch (stack.nation) {
          case "LIYUE":
            result = appCharacter.nation === "liyue" ? 1 : 0;
            characterData.forEachTeammate((data) => (result += data.nation === "liyue" ? 1 : 0));
            break;
          case "SAME_EXCLUDED":
            characterData.forEachTeammate((data) => (result += data.nation === appCharacter.nation ? 1 : 0));
            break;
          case "DIFFERENT":
            characterData.forEachTeammate((data) => (result += data.nation !== appCharacter.nation ? 1 : 0));
            break;
        }
        break;
      }
      case "RESOLVE": {
        let [totalEnergy = 0, electroEnergy = 0] = inputs;
        if (characterData.character.cons >= 1 && electroEnergy <= totalEnergy) {
          totalEnergy += electroEnergy * 0.8 + (totalEnergy - electroEnergy) * 0.2;
        }
        const level = characterData.getFinalTalentLv("EB");
        const stackPerEnergy = Math.min(Math.ceil(14.5 + level * 0.5), 20);
        const stacks = Math.round(totalEnergy * stackPerEnergy) / 100;
        // const countResolve = (energyCost: number) => Math.round(energyCost * stackPerEnergy) / 100;

        result = Math.min(stacks, 60);
        break;
      }
      case "MIX": {
        result = appCharacter.nation === "natlan" ? 1 : 0;

        characterData.forEachTeammate((data) => {
          result += data.nation === "natlan" || data.vision !== appCharacter.vision ? 1 : 0;
        });
        break;
      }
    }

    if (stack.capacity) {
      const capacityExtra = stack.capacity.extra;
      const capacity =
        stack.capacity.value +
        (isApplicableEffect(capacityExtra, characterData, inputs, fromSelf) ? capacityExtra.value : 0);

      result = Math.max(capacity - result, 0);
    }
    if (stack.baseline) {
      if (result <= stack.baseline) return 0;
      result -= stack.baseline;
    }
    if (stack.extra && isApplicableEffect(stack.extra, characterData, inputs, fromSelf)) {
      result += stack.extra.value;
    }

    // check before applyMax because max stack in number does not auto scale with refi
    result = typeof stack.max === "number" ? Math.min(result, stack.max) : this.applyMax(result, stack.max, support);

    return Math.max(result, 0);
  };

  protected getBareBonus = (
    config: EntityBonusCore,
    { inputs, fromSelf = true, refi = 0 }: PartiallyOptional<GetBareBonusSupportInfo, "fromSelf">,
    basedOnStable = false
  ): BareBonus => {
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

    initial.value *= this.characterData.getLevelScale(config.lvScale, inputs, fromSelf);

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
