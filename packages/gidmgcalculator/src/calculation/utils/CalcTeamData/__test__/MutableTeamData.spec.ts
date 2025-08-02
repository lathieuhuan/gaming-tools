import { TalentType } from "@Src/calculation/types";
import { Character } from "@Src/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genMutableTeamDataTester } from "@UnitTest/test-utils";

let tester: ReturnType<typeof __genMutableTeamDataTester>;
let activeMember: Character;

beforeEach(() => {
  tester = __genMutableTeamDataTester();
  activeMember = tester.activeMember;
});

type GetTotalXtraTalentLvTestCase = {
  constellation: number;
  /** [NAs, ES, EB] */
  expect: [number, number, number];
};

describe("getTotalXtraTalentLv", () => {
  test("total extra talent levels on constellation level 0, 3, 5", () => {
    const testCases: GetTotalXtraTalentLvTestCase[] = [
      {
        constellation: 0,
        expect: [0, 0, 0],
      },
      {
        constellation: 3,
        expect: [0, 3, 0],
      },
      {
        constellation: 5,
        expect: [0, 3, 3],
      },
    ];
    const expectTypes: TalentType[] = ["NAs", "ES", "EB"];

    testCases.forEach((testCase) => {
      activeMember.cons = testCase.constellation;

      testCase.expect.forEach((expectValue, i) => {
        expect(tester.getTotalXtraTalentLv(expectTypes[i])).toBe(expectValue);
      });
    });
  });

  test("total extra NAs level of Tartaglia", () => {
    tester.__changeActiveMember(__EMockCharacter.TARTAGLIA);

    expect(tester.getTotalXtraTalentLv("NAs")).toBe(1);
  });

  test("total extra NAs level when Tartaglia is a teammate", () => {
    tester.__changeTeammates([__EMockCharacter.TARTAGLIA]);
    expect(tester.getTotalXtraTalentLv("NAs")).toBe(1);
  });

  test("total extra ES level of Skirk", () => {
    tester.__changeActiveMember(__EMockCharacter.SKIRK);

    // VALID TEAM ELEMENTS
    tester.__changeTeammates([__EMockCharacter.TARTAGLIA]);
    expect(tester.getTotalXtraTalentLv("ES")).toBe(1);

    // INVALID TEAM ELEMENTS
    tester.__changeTeammates([__EMockCharacter.BASIC]);
    expect(tester.getTotalXtraTalentLv("ES")).toBe(0);
  });

  test("total extra ES level when Skirk is a teammate", () => {
    tester.__changeTeammates([__EMockCharacter.SKIRK]);

    // VALID TEAM ELEMENTS
    tester.__changeActiveMember(__EMockCharacter.TARTAGLIA);
    expect(tester.getTotalXtraTalentLv("ES")).toBe(1);

    // INVALID TEAM ELEMENTS
    tester.__changeActiveMember(__EMockCharacter.BASIC);
    expect(tester.getTotalXtraTalentLv("ES")).toBe(0);
  });
});

test("getFinalTalentLv", () => {
  expect(tester.getFinalTalentLv("NAs")).toBe(activeMember.NAs);
  expect(tester.getFinalTalentLv("ES")).toBe(activeMember.ES);
  expect(tester.getFinalTalentLv("EB")).toBe(activeMember.EB);
  expect(tester.getFinalTalentLv("altSprint")).toBe(0);
});
