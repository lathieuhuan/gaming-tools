import { CharacterData } from "@Src/backend/common-utils";
import { EffectValueByOption } from "@Src/backend/types";

export class EffectValueGetter<T extends CharacterData = CharacterData> {
  constructor(protected characterData: T) {}

  /**
   * @param inputs used when optIndex is number or has INPUT source
   */
  protected getIndexOfEffectValue = (config: Pick<EffectValueByOption, "optIndex">, inputs: number[] = []) => {
    const { characterData } = this;
    const { optIndex = 0 } = config;
    const elmtCount = characterData.allElmtCount;
    const indexConfig =
      typeof optIndex === "number"
        ? ({ source: "INPUT", inpIndex: optIndex } satisfies EffectValueByOption["optIndex"])
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
}
