import { TalentType } from "@Src/backend/types";
import { Character } from "@Src/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genCharacterDataTester } from "@UnitTest/test-utils";

let tester: ReturnType<typeof __genCharacterDataTester>;
let character: Character;

beforeEach(() => {
  tester = __genCharacterDataTester();
  character = tester.character;
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
      character.cons = testCase.constellation;

      testCase.expect.forEach((expectValue, i) => {
        expect(tester.getTotalXtraTalentLv(expectTypes[i])).toBe(expectValue);
      });
    });
  });

  test("total extra NAs level of Tartaglia", () => {
    tester.__updateCharacter(__EMockCharacter.TARTAGLIA);

    expect(tester.getTotalXtraTalentLv("NAs")).toBe(1);
  });

  test("total extra NAs level when Tartaglia is in party", () => {
    tester.__updateParty([__EMockCharacter.TARTAGLIA]);
    expect(tester.getTotalXtraTalentLv("NAs")).toBe(1);
  });
});

test("getFinalTalentLv", () => {
  expect(tester.getFinalTalentLv("NAs")).toBe(character.NAs);
  expect(tester.getFinalTalentLv("ES")).toBe(character.ES);
  expect(tester.getFinalTalentLv("EB")).toBe(character.EB);
  expect(tester.getFinalTalentLv("altSprint")).toBe(0);
});

describe("getLevelScale", () => {
  beforeEach(() => {
    character.ES = 10;
  });

  test("at scale 0, fromSelf", () => {
    expect(tester.getLevelScale({ talent: "ES", value: 0 }, [], true)).toBe(character.ES);
  });

  test("at scale 2, fromSelf", () => {
    expect(tester.getLevelScale({ talent: "ES", value: 2 }, [], true)).toBe(1.8); // TALENT_LV_MULTIPLIERS[2][character.ES]
  });

  test("at scale 2, not fromSelf, altIndex default (0)", () => {
    expect(tester.getLevelScale({ talent: "ES", value: 2 }, [7], false)).toBe(1.5); // TALENT_LV_MULTIPLIERS[2][7]
  });

  test("at scale 2, not fromSelf, altIndex 1", () => {
    expect(tester.getLevelScale({ talent: "ES", value: 2, altIndex: 1 }, [0, 10], false)).toBe(1.8); // TALENT_LV_MULTIPLIERS[2][10]
  });
});
