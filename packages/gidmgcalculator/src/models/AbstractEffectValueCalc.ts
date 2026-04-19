import { Array_, round, toMult } from "ron-utils";

import type {
  CharacterBuff,
  CharacterDebuff,
  TalentLevelIncrementSpec,
  EffectValueSpec,
  EffectValueByOptionSpec,
  ElementCount,
  TalentLevelIncrementBaseSpec,
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

type LevelIncrement = {
  multiplier: number;
  extra: number;
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

  protected getInput(index = 0, defaultValue = 0) {
    return this.inputs[index] ?? defaultValue;
  }

  protected abstract getTalentLevel(config: TalentLevelIncrementBaseSpec): number;

  // ===== LEVEL INCREMENT =====

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

  // ===== INDEX OF EFFECT VALUE =====

  protected getIndexOfEffectValue(config: EffectValueByOptionSpec) {
    const { performer } = this;
    const { elmtCount } = this.team;
    const indexConfig = config.optIndex || {
      source: "INPUT",
      inpIndex: 0,
    };
    let indexValue = -1;

    switch (indexConfig.source) {
      case "INPUT":
        indexValue += this.getInput(indexConfig.inpIndex);
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
              if (elementType !== performer.data.vision) indexValue++;
            });
            break;
          default:
            if (typeof indexConfig.element === "string") {
              indexValue += elmtCount.get(indexConfig.element);
            } else {
              indexValue += indexConfig.element.reduce(
                (total, type) => total + elmtCount.get(type),
                0
              );
            }
        }
        break;
      }
      default:
        indexConfig satisfies never;
    }

    return indexValue;
  }

  // ===== INITIAL VALUE =====
  abstract getInitialValue(effect: EffectToGetInitialValue): number;

  parseAbilityDesc({ description, effects }: Pick<AbilityBuff, "description" | "effects">) {
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
