import type { InputCheck } from "@Src/backend/types";
import type { CalcUltilInfo } from "../calculation.types";
import { GeneralCalc } from "./general-calc";

export class EntityCalc {
  static isValidEffectByInput(info: CalcUltilInfo, inputs: number[], checkInput?: number | InputCheck) {
    if (checkInput !== undefined) {
      const { value, source = 0, type = "equal" } = typeof checkInput === "number" ? { value: checkInput } : checkInput;
      let input = 0;

      switch (source) {
        case "various_vision":
          if (info.partyData.length) {
            input = Object.keys(GeneralCalc.countElements(info.partyData, info.appChar)).length;
          } else {
            return false;
          }
          break;
        case "BOL":
          // #to-check: should require charStatus on CalcUltilInfo for parseAbilityDescription to work
          if (info.charStatus) input = info.charStatus.BOL;
          break;
        default:
          input = inputs[source];
      }

      switch (type) {
        case "equal":
          if (input !== value) return false;
          else break;
        case "min":
          if (input < value) return false;
          else break;
        case "max":
          if (input > value) return false;
          else break;
      }
    }
    return true;
  }
}
