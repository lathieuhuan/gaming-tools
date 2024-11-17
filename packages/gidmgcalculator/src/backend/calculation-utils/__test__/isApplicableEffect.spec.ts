import { AppCharacter, EffectApplicableCondition } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { Character } from "@Src/types";
import { characters, EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { isApplicableEffect } from "../isApplicableEffect";

const char: Character = {
  name: EMockCharacter.BASIC,
  level: "1/20",
  cons: 0,
  NAs: 1,
  ES: 1,
  EB: 1,
};
let appChar: AppCharacter;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  appChar = $AppCharacter.get(EMockCharacter.BASIC);
});

describe("checkInput condition", () => {
  const info = {
    char,
    appChar,
    partyData: [],
  };
  const condition: EffectApplicableCondition = {
    checkInput: 1,
  };

  test("checkInput from inputs", () => {
    condition.checkInput = 1;
    expect(isApplicableEffect(condition, info, [condition.checkInput])).toBe(true);
    expect(isApplicableEffect(condition, info, [condition.checkInput + 1])).toBe(false);

    condition.checkInput = {
      value: 1,
    };
    const input = condition.checkInput.value;
    expect(isApplicableEffect(condition, info, [input])).toBe(true);
    expect(isApplicableEffect(condition, info, [input + 1])).toBe(false);
  });
});
