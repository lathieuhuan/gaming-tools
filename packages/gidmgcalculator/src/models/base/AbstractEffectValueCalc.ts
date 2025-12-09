import type {
  CharacterEffectLevelScale,
  EffectValue,
  EffectValueByOption,
  ElementCount,
  ITeam,
  ITeamMember,
  TalentLevelScaleConfig,
} from "@/types";

import { Character } from "./Character";

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
}
