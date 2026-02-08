import type {
  CharacterBuff,
  CharacterDebuff,
  CharacterEffectLevelScale,
  EffectValue,
  EffectValueByOption,
  ElementCount,
  ITeam,
  ITeamMember,
  TalentLevelScaleConfig,
} from "@/types";

import Array_ from "@/utils/Array";
import { wrapText } from "@/utils/description-parsers/utils";
import { round, toMult } from "@/utils/pure-utils";
import { Character } from "../base";

type AbilityBuff = CharacterBuff | CharacterDebuff;

export type EffectToGetInitialValue = {
  value: EffectValue;
  lvScale?: CharacterEffectLevelScale;
};

export abstract class AbstractEffectValueCalc<TPerformer extends ITeamMember = ITeamMember> {
  protected teammateElmtCount: ElementCount;

  constructor(
    protected performer: TPerformer,
    protected team: ITeam,
    protected inputs: number[] = []
  ) {
    this.teammateElmtCount = team.elmtCount.clone();
    this.teammateElmtCount.remove(performer.data.vision);
  }

  protected getInput(index = 0, defaultValue = 0) {
    return this.inputs[index] ?? defaultValue;
  }

  protected abstract getTalentLevel(config: TalentLevelScaleConfig): number;

  // ===== LEVEL SCALE =====

  protected getLevelScale(scale?: CharacterEffectLevelScale) {
    if (scale) {
      const { value, max } = scale;
      const level = this.getTalentLevel(scale);
      const result = value ? Character.getTalentMult(value, level) : level;
      return max && result > max ? max : result;
    }

    return 1;
  }

  // ===== INDEX OF EFFECT VALUE =====

  protected getIndexOfEffectValue(config: EffectValueByOption) {
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
      case "LEVEL": {
        indexValue += this.getTalentLevel(indexConfig);
        break;
      }
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
