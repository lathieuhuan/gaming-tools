import { EffectApplicableCondition } from "@/calculation/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genMutableTeamDataTester, MutableTeamDataTester } from "@UnitTest/test-utils";
import { isValidTeamElmt } from "../isValidTeamElmt";

describe("isValidTeamElmt", () => {
  let tester: MutableTeamDataTester;
  let condition: EffectApplicableCondition = {};

  const __expectValue = (value: boolean) => {
    expect(isValidTeamElmt(tester.elmtCount, condition)).toBe(value);
  };

  beforeEach(() => {
    tester = __genMutableTeamDataTester();
    condition = {};
  });

  test("teamOnlyElmts: all elements of character & teammates must be included in teamOnlyElmts", () => {
    const electroCharacter = __EMockCharacter.CATALYST;

    condition.teamOnlyElmts = ["pyro"];

    tester.__changeActiveMember(__EMockCharacter.BASIC);
    __expectValue(true);

    tester.__changeTeammates([electroCharacter]);
    __expectValue(false);

    condition.teamOnlyElmts = ["pyro", "electro"];
    __expectValue(true);
  });

  test("teamEachElmtCount: the number of characters whose elements are listed must be atleast the listed value", () => {
    const electroCharacter = __EMockCharacter.CATALYST;

    condition.teamEachElmtCount = {
      pyro: 1,
    };

    tester.__changeActiveMember(__EMockCharacter.CATALYST);
    __expectValue(false);

    tester.__changeActiveMember(__EMockCharacter.BASIC);
    __expectValue(true);

    tester.__changeTeammates([__EMockCharacter.BASIC]);
    __expectValue(true);

    condition.teamEachElmtCount = {
      pyro: 1,
      electro: 2,
    };

    tester.__changeActiveMember(__EMockCharacter.BASIC);
    __expectValue(false);

    tester.__changeTeammates([electroCharacter]);
    __expectValue(false);

    tester.__changeTeammates([electroCharacter, electroCharacter]);
    __expectValue(true);
  });

  test("teamElmtTotalCount: the total number of characters whose elements are included must pass the comparison", () => {
    const pyroCharacter = __EMockCharacter.BASIC;
    const electroCharacter = __EMockCharacter.CATALYST;

    condition.teamElmtTotalCount = {
      elements: ["pyro"],
      comparison: "MAX",
      value: 1,
    };

    tester.__changeActiveMember(__EMockCharacter.BASIC);
    __expectValue(true);

    tester.__changeTeammates([electroCharacter]);
    __expectValue(true);

    tester.__changeTeammates([pyroCharacter]);
    __expectValue(false);

    condition.teamElmtTotalCount = {
      elements: ["pyro", "electro"],
      comparison: "MAX",
      value: 2,
    };

    tester.__changeActiveMember(__EMockCharacter.BASIC);
    __expectValue(true);

    tester.__changeTeammates([electroCharacter]);
    __expectValue(true);

    tester.__changeTeammates([electroCharacter, electroCharacter]);
    __expectValue(false);

    tester.__changeTeammates([electroCharacter, pyroCharacter]);
    __expectValue(false);

    tester.__changeTeammates([electroCharacter, __EMockCharacter.TARTAGLIA]);
    __expectValue(true);
  });

  test("teamTotalElmtCount: the total elements of characters must pass the comparison", () => {
    condition.teamTotalElmtCount = {
      elements: ["pyro"],
      comparison: "MIN",
      value: 1,
    };

    tester.__changeActiveMember(__EMockCharacter.CATALYST);
    __expectValue(false);

    tester.__changeActiveMember(__EMockCharacter.BASIC);
    __expectValue(true);
  });
});
