import { Array_, round, toMult } from "ron-utils";

import type {
  CharacterBuff,
  CharacterDebuff,
  EffectExtraSpec,
  EffectMaxSpec,
  EffectPerformableConditionSpecs,
  EffectStackSpec,
  EffectValueByOptionSpec,
  EffectValueSpec,
  ElementCount,
  InputStackSpec,
  StacksBonusSpec,
  TalentLevelIncrementBaseSpec,
  TalentLevelIncrementSpec,
  TeamConditionSpecs,
  TeamMember,
} from "@/types";
import type { Team } from "./Team";

import { wrapText } from "@/utils/descriptionParsers/utils";
import { Character } from "./Character";

type AbilityBuff = CharacterBuff | CharacterDebuff;

export type EffectToGetInitialValue = {
  value: EffectValueSpec;
  lvIncre?: TalentLevelIncrementSpec;
};

export type EffectToParseDesc = Pick<AbilityBuff, "description" | "effects">;

type LevelIncrement = {
  multiplier: number;
  extra: number;
};

type Stacks = {
  value: number;
  isMax: boolean;
};

export abstract class AbstractEffectValueCalc<TPerformer extends TeamMember = TeamMember> {
  protected teammateElmtCount: ElementCount;

  constructor(
    protected performer: TPerformer,
    protected team: Team,
    protected inputs: number[] = []
  ) {
    this.teammateElmtCount = team.elmtCount.clone();
    this.teammateElmtCount.remove(performer.data.vision);
  }

  // UTILS

  protected abstract getTalentLevel(config: TalentLevelIncrementBaseSpec): number;

  protected itemAt(index: number, list: number[], defaultValue = 0) {
    if (index < 0) {
      console.warn(`Access negative index (${index}) of [${list.toString()}]`);
    }

    const value = list[index] || (index > 0 ? list.at(-1) : null);
    return value ?? defaultValue;
  }

  protected getInput(index = 0, defaultValue = 0) {
    return this.itemAt(index, this.inputs, defaultValue);
  }

  protected isPerformableEffect(condition?: EffectPerformableConditionSpecs) {
    return (
      this.team.isAvailableEffect(condition) &&
      this.performer.canPerformEffect(condition, this.inputs)
    );
  }

  // MAIN LOGIC

  protected abstract getInputIndex(spec: InputStackSpec): NonNullable<InputStackSpec["index"]>;

  protected abstract getMax(spec?: EffectMaxSpec): number;

  protected getExtra(extras: EffectExtraSpec | EffectExtraSpec[] = []) {
    let result = 0;

    for (const extra of Array_.toArray(extras)) {
      if (this.isPerformableEffect(extra)) {
        result += extra.value;
      }
    }

    return result;
  }

  getStacks(spec?: EffectStackSpec): Stacks | null {
    if (!spec) {
      return null;
    }
    const { inputs, performer, teammateElmtCount, team } = this;
    const { members, elmtCount } = team;

    let stacks = 0;

    switch (spec.type) {
      case "INPUT": {
        const inpIndex = this.getInputIndex(spec);

        if (typeof inpIndex === "number") {
          let input = inputs[inpIndex] ?? 0;

          if (spec.doubledAt !== undefined && inputs[spec.doubledAt]) {
            input *= 2;
          }

          stacks = input;
        } else {
          stacks = inpIndex.reduce(
            (total, { value, ratio = 1 }) => total + (inputs[value] ?? 0) * ratio,
            0
          );
        }
        break;
      }
      case "ELEMENT": {
        const { elements } = spec;

        stacks = elements
          ? elmtCount.keys.reduce(
              (total, elementType) => total + (elements.includes(elementType) ? 1 : 0),
              0
            )
          : elmtCount.keys.length;
        break;
      }
      case "MEMBER": {
        const performerElmt = performer.data.vision;

        switch (spec.element) {
          case "DIFFERENT":
            teammateElmtCount.forEach((type, value) => {
              stacks += type !== performerElmt ? value : 0;
            });
            break;
          case "SAME_EXCLUDED":
            teammateElmtCount.forEach((type, value) => {
              stacks += type === performerElmt ? value : 0;
            });
            break;
          case "SAME_INCLUDED":
            team.elmtCount.forEach((type, value) => {
              stacks += type === performerElmt ? value : 0;
            });
            break;
          default:
            team.elmtCount.forEach((type, value) => {
              stacks += spec.element.includes(type) ? value : 0;
            });
        }
        break;
      }
      case "ENERGY": {
        if (spec.scope === "PARTY") {
          stacks = members.reduce((total, { data }) => total + data.EBcost, 0);
        } else {
          stacks = performer.data.EBcost;
        }
        break;
      }
      case "NATION": {
        const performerNation = performer.data.nation;

        switch (spec.nation) {
          case "LIYUE":
            stacks = members.reduce(
              (total, { data }) => total + (data.nation === "liyue" ? 1 : 0),
              0
            );
            break;
          case "SAME_EXCLUDED":
            stacks = members.reduce(
              (total, { data }) => total + (data.nation === performerNation ? 1 : 0),
              -1
            );
            break;
          case "DIFFERENT":
            stacks = members.reduce(
              (total, { data }) => total + (data.nation !== performerNation ? 1 : 0),
              0
            );
            break;
        }
        break;
      }
      case "MIX": {
        stacks = this.team["getMixedCount"](performer.data.vision);
        break;
      }
      default:
        spec satisfies never;
    }

    if (spec.capacity) {
      const capacityExtra = spec.capacity.extra;
      const capacity =
        spec.capacity.value + (this.isPerformableEffect(capacityExtra) ? capacityExtra.value : 0);

      stacks = Math.max(capacity - stacks, 0);
    }

    if (spec.baseline) {
      if (stacks <= spec.baseline) {
        return {
          value: 0,
          isMax: false,
        };
      }
      stacks -= spec.baseline;
    }

    if (spec.extra && this.isPerformableEffect(spec.extra)) {
      stacks += spec.extra.value;
    }

    /** check before getMax because max stack in number does not auto scale with refi */
    const max = typeof spec.max === "number" ? spec.max : this.getMax(spec.max);

    stacks = Math.max(Math.min(stacks, max), 0);

    return {
      value: stacks,
      isMax: stacks === max,
    };
  }

  protected getStacksBonus(spec: StacksBonusSpec, stacks: Stacks) {
    if (typeof spec.at === "number") {
      if (stacks.value >= spec.at) {
        return spec.value;
      }
    }

    return stacks.isMax ? spec.value : 0;
  }

  protected getLevelIncre(spec?: TalentLevelIncrementSpec): LevelIncrement {
    if (!spec) {
      return { multiplier: 1, extra: 0 };
    }

    const level = this.getTalentLevel(spec);

    if ("scale" in spec) {
      return {
        extra: 0,
        multiplier: Character.getTalentMult(spec.scale, level),
      };
    }

    const { changes } = spec;
    let value = spec.value * level;

    if (changes && level >= changes.startAt) {
      value += changes.value * (level - changes.startAt + 1);
    }

    return { extra: value, multiplier: 1 };
  }

  protected getIndexOfEffectValue(spec: EffectValueByOptionSpec) {
    const { preOptions } = spec;
    // -1 because getInput should return >= 1 (stacks)
    let index = -1;

    // Navia
    if (preOptions) {
      const [preIndex = 0, optionIndex = 0] = this.inputs;
      const preValue = this.itemAt(preIndex, preOptions);

      index += optionIndex ? Math.min(optionIndex, preValue) : preValue;
    } else {
      index += this.getInput(spec.inpIndex) + this.getExtra(spec.extra);
    }

    return index;
  }

  abstract getInitialValue(effect: EffectToGetInitialValue): number;

  parseAbilityDesc({ description, effects }: EffectToParseDesc) {
    return description.replace(/\{.+?\}#\[\w*\]/g, (match) => {
      let [body, type = ""] = match.split("#");
      body = body.slice(1, -1);
      type = type.slice(1, -1);

      if (body[0] === "@") {
        const effect = Array_.toArray(effects)[+body[1]];

        if (effect) {
          const { preExtra, max } = effect;
          let result = this.getInitialValue(effect);

          if (typeof preExtra === "number") result += preExtra;
          if (typeof max === "number" && result > max) result = max;

          const decimal = +body[3];
          if (!isNaN(decimal)) {
            if (body[2] === "'") result *= 100;
            result = round(result, decimal);
          }

          switch (body[body.length - 1]) {
            case "%":
              body = result + "%";
              break;
            case "*":
              body = `${round(toMult(result), 3)}`;
              break;
            default:
              body = `${result}`;
          }
        }
      }
      if (body[0] === "@") body = "?";

      return wrapText(body, type);
    });
  }
}
