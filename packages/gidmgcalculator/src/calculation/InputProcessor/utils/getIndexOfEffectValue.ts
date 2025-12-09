import { CalcTeamData } from "@/calculation/CalcTeamData";
import { EffectValueByOption } from "@/calculation/types";
import { getTmEffectInput } from "./getTmEffectInput";

/**
 * @param inputs used when optIndex is number or has INPUT source
 */
export const getIndexOfEffectValue = (
  config: EffectValueByOption["optIndex"],
  teamData: CalcTeamData,
  inputs: number[] = [],
  fromSelf: boolean
) => {
  const elmtCount = teamData.elmtCount;
  const indexConfig = config || {
    source: "INPUT",
    inpIndex: 0,
  };
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
            if (elementType !== teamData.activeAppMember.vision) indexValue++;
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
      indexValue += fromSelf
        ? teamData.getFinalTalentLv(indexConfig.talent)
        : getTmEffectInput(indexConfig, inputs);
      break;
    }
  }
  return indexValue;
};
