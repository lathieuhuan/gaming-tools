import type {
  BareBonus,
  BonusPerformTools,
  CharacterEffectLevelIncrement,
  EffectExtra,
  EffectMax,
  EffectPerformableCondition,
  EntityBonusBasedOn,
  EntityBonusBasedOnField,
  EntityBonusEffect,
  EntityBonusStack,
  InputStack,
  ITeam,
  ITeamMember,
} from "@/types";

import Array_ from "@/utils/Array";
import { AbstractEffectValueCalc } from "./AbstractEffectValueCalc";

const TEAM_DEPENDED_STACK_TYPES: EntityBonusStack["type"][] = [
  "MEMBER",
  "ENERGY",
  "NATION",
  "RESOLVE",
  "MIX",
];

export abstract class AbstractBonusCalc<
  TPerformer extends ITeamMember = ITeamMember
> extends AbstractEffectValueCalc<TPerformer> {
  //
  protected basedOnFixed = false;
  protected refi = 0;

  constructor(
    protected performer: TPerformer,
    protected team: ITeam,
    { inputs = [], refi = 0, basedOnFixed = false }: Partial<BonusPerformTools>
  ) {
    super(performer, team, inputs);

    this.refi = refi;
    this.basedOnFixed = basedOnFixed;
  }

  private isPerformableEffect(condition?: EffectPerformableCondition) {
    return (
      this.team.isAvailableEffect(condition) &&
      this.performer.isPerformableEffect(condition, this.inputs)
    );
  }

  protected scaleRefi(base: number, increment = base / 3) {
    return base + increment * this.refi;
  }

  protected parseBasedOn(config: EntityBonusBasedOn) {
    return typeof config === "string" ? { field: config } : config;
  }

  protected abstract getLvIncre(incre?: CharacterEffectLevelIncrement): number;
  protected abstract getBasedOn(config: EntityBonusBasedOn): {
    field: EntityBonusBasedOnField;
    value: number;
  };

  protected applyMax(value: number, config?: EffectMax) {
    if (typeof config === "number") {
      return Math.min(value, this.scaleRefi(config));
    }

    if (config) {
      let finalMax = config.value;

      if (config.basedOn) {
        finalMax *= this.getBasedOn(config.basedOn).value;
      }
      finalMax += this.getExtra(config.extras);
      finalMax = this.scaleRefi(finalMax, config.incre);
      finalMax += this.getLvIncre(config.lvIncre);

      return Math.min(value, finalMax);
    }

    return value;
  }

  protected getExtra(extras: EffectExtra | EffectExtra[] = []) {
    let result = 0;

    for (const extra of Array_.toArray(extras)) {
      if (this.isPerformableEffect(extra)) {
        result += extra.value;
      }
    }

    return result;
  }

  getInitialValue(effect: Pick<EntityBonusEffect, "value" | "lvScale">) {
    const config = effect.value;
    const lvScale = this.getLevelScale(effect.lvScale);

    if (typeof config === "number") {
      return config * lvScale;
    }
    const { options } = config;
    let index = this.getIndexOfEffectValue(config);

    index += this.getExtra(config.extra);
    index = this.applyMax(index, config.max);

    const value = options[index] ?? (index > 0 ? options[options.length - 1] : 0);

    return value * lvScale;
  }

  protected applyExtra(bonus: BareBonus, config?: number | EntityBonusEffect) {
    if (typeof config === "number") {
      bonus.value += this.scaleRefi(config);
    } //
    else if (config && this.isPerformableEffect(config)) {
      const extra = this.makeBonus(config);

      if (extra) {
        bonus.value += extra.value;
        // if extra is dynamic, this whole bonus is dynamic
        if (extra.isDynamic) bonus.isDynamic = true;
      }
    }
  }

  // ↓↓↓ STACKS ↓↓↓

  protected get resolveStacks() {
    return 0;
  }

  protected abstract getInputIndex(stack: InputStack): NonNullable<InputStack["index"]>;

  getStackValue(stack?: EntityBonusStack) {
    if (!stack) {
      return 1;
    }
    const { inputs, performer, teammateElmtCount, team } = this;
    const { members } = team;

    if (TEAM_DEPENDED_STACK_TYPES.includes(stack.type) && members.length <= 1) {
      return 0;
    }

    let result = 0;

    switch (stack.type) {
      case "INPUT": {
        const inpIndex = this.getInputIndex(stack);

        if (typeof inpIndex === "number") {
          let input = inputs[inpIndex] ?? 0;

          if (stack.doubledAt !== undefined && inputs[stack.doubledAt]) {
            input *= 2;
          }

          result = input;
        } else {
          result = inpIndex.reduce(
            (total, { value, ratio = 1 }) => total + (inputs[value] ?? 0) * ratio,
            0
          );
        }
        break;
      }
      case "MEMBER": {
        const performerElmt = performer.data.vision;

        switch (stack.element) {
          case "DIFFERENT":
            teammateElmtCount.forEach((type, value) => {
              result += type !== performerElmt ? value : 0;
            });
            break;
          case "SAME_EXCLUDED":
            teammateElmtCount.forEach((type, value) => {
              result += type === performerElmt ? value : 0;
            });
            break;
          case "SAME_INCLUDED":
            team.elmtCount.forEach((type, value) => {
              result += type === performerElmt ? value : 0;
            });
            break;
          default:
            team.elmtCount.forEach((type, value) => {
              result += type === stack.element ? value : 0;
            });
        }
        break;
      }
      case "ENERGY": {
        if (stack.scope === "PARTY") {
          result = members.reduce((total, { data }) => total + data.EBcost, 0);
        } else {
          result = performer.data.EBcost;
        }
        break;
      }
      case "NATION": {
        const performerNation = performer.data.nation;

        switch (stack.nation) {
          case "LIYUE":
            result = members.reduce(
              (total, { data }) => total + (data.nation === "liyue" ? 1 : 0),
              0
            );
            break;
          case "SAME_EXCLUDED":
            result = members.reduce(
              (total, { data }) => total + (data.nation === performerNation ? 1 : 0),
              -1
            );
            break;
          case "DIFFERENT":
            result = members.reduce(
              (total, { data }) => total + (data.nation !== performerNation ? 1 : 0),
              0
            );
            break;
        }
        break;
      }
      case "RESOLVE": {
        result = this.resolveStacks;
        break;
      }
      case "MIX": {
        result = this.team["getMixedCount"](performer.data.vision);
        break;
      }
    }

    if (stack.capacity) {
      const capacityExtra = stack.capacity.extra;
      const capacity =
        stack.capacity.value + (this.isPerformableEffect(capacityExtra) ? capacityExtra.value : 0);

      result = Math.max(capacity - result, 0);
    }

    if (stack.baseline) {
      if (result <= stack.baseline) return 0;
      result -= stack.baseline;
    }

    if (stack.extra && this.isPerformableEffect(stack.extra)) {
      result += stack.extra.value;
    }

    // check before applyMax because max stack in number does not auto scale with refi
    result =
      typeof stack.max === "number"
        ? Math.min(result, stack.max)
        : this.applyMax(result, stack.max);

    return Math.max(result, 0);
  }

  // ↑↑↑ STACKS ↑↑↑

  makeBonus(config: EntityBonusEffect): BareBonus {
    const bonus: BareBonus = {
      // id: config.id,
      value: this.getInitialValue(config),
      isDynamic: false,
      config,
    };

    bonus.value = this.scaleRefi(bonus.value, config.incre);

    this.applyExtra(bonus, config.preExtra);

    if (config.basedOn) {
      const basedOn = this.getBasedOn(config.basedOn);

      bonus.value *= basedOn.value;
      bonus.isDynamic = basedOn.field !== "base_atk";
    }

    bonus.value *= this.getStackValue(config.stacks);

    this.applyExtra(bonus, config.sufExtra);

    bonus.value = this.applyMax(bonus.value, config.max);

    return bonus;
  }
}
