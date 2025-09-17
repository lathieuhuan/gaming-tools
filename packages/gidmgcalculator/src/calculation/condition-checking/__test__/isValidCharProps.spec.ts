import { CharacterPropertyCondition } from "@/calculation/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genMutableTeamDataTester, MutableTeamDataTester } from "@UnitTest/test-utils";
import { isValidCharProps } from "../isValidCharProps";

describe("isValidCharProps", () => {
  let tester: MutableTeamDataTester;
  let condition: CharacterPropertyCondition;

  const __expectValue = (value: boolean) => {
    expect(isValidCharProps(condition, tester.activeAppMember)).toBe(value);
  };

  beforeEach(() => {
    tester = __genMutableTeamDataTester();
    condition = {};
  });

  test("forElmts: app character's element type included in forElmts", () => {
    condition.forElmts = ["pyro"];

    tester.__changeActiveMember(__EMockCharacter.BASIC);
    __expectValue(true);

    tester.__changeActiveMember(__EMockCharacter.CATALYST);
    __expectValue(false);

    condition.forElmts = ["pyro", "electro"];

    tester.__changeActiveMember(__EMockCharacter.BASIC);
    __expectValue(true);

    tester.__changeActiveMember(__EMockCharacter.CATALYST);
    __expectValue(true);
  });

  test("forWeapons: app character weapon type included in forWeapons", () => {
    condition.forWeapons = ["sword"];

    tester.__changeActiveMember(__EMockCharacter.BASIC);
    __expectValue(true);

    tester.__changeActiveMember(__EMockCharacter.CATALYST);
    __expectValue(false);

    condition.forWeapons = ["sword", "catalyst"];

    tester.__changeActiveMember(__EMockCharacter.BASIC);
    __expectValue(true);

    tester.__changeActiveMember(__EMockCharacter.CATALYST);
    __expectValue(true);
  });
});
