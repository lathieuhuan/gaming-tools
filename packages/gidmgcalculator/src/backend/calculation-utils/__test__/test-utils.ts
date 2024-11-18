import { CalculationInfo, EffectApplicableCondition } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { Character, PartyData } from "@Src/types";
import { EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { isApplicableEffect } from "../isApplicableEffect";

export class Operator {
  info: CalculationInfo;
  condition: EffectApplicableCondition = {};

  constructor(
    char: Character = {
      name: EMockCharacter.BASIC,
      level: "1/20",
      cons: 0,
      NAs: 1,
      ES: 1,
      EB: 1,
    },
    partyData: PartyData = []
  ) {
    this.info = {
      char,
      appChar: $AppCharacter.get(EMockCharacter.BASIC),
      partyData,
    };
  }

  set checkInput(value: EffectApplicableCondition["checkInput"]) {
    this.condition.checkInput = value;
  }

  get checkInputValue() {
    const { checkInput } = this.condition;
    const value = typeof checkInput === "number" ? checkInput : checkInput!.value;
    return value;
  }

  expectWithInputs(inputs: number[]) {
    return expect(isApplicableEffect(this.condition, this.info, inputs));
  }
}
