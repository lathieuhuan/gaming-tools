import { $AppCharacter } from "@Src/services";
import { characters, EMockCharacter } from "@Mocks/characters.mock";
import { Character } from "@Src/types";
import { CharacterCalc } from "../character-calc";
import { AppCharacter, CalculationInfo, TalentType } from "@Src/backend/types";

type GetTotalXtraTalentLvTestCase = {
  constellation: number;
  /** [NAs, ES, EB] */
  expect: [number, number, number];
};

let char: Character;
let appChar: AppCharacter;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  char = {
    name: EMockCharacter.BASIC,
    level: "1/20",
    cons: 0,
    NAs: 1,
    ES: 1,
    EB: 1,
  };
  appChar = $AppCharacter.get(EMockCharacter.BASIC);
});

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
      char.cons = testCase.constellation;

      testCase.expect.forEach((expectValue, i) => {
        expect(CharacterCalc.getTotalXtraTalentLv({ char, appChar, talentType: expectTypes[i] })).toEqual(expectValue);
      });
    });
  });

  test("total extra NAs level of Tartaglia", () => {
    const Tartaglia = characters.find((character) => character.name === EMockCharacter.TARTAGLIA)!;

    char.name = EMockCharacter.TARTAGLIA;

    expect(
      CharacterCalc.getTotalXtraTalentLv({
        char,
        appChar: Tartaglia,
        talentType: "NAs",
        partyData: [],
      })
    ).toEqual(1);
  });

  test("total extra NAs level when Tartaglia is in party", () => {
    const Tartaglia = characters.find((character) => character.name === EMockCharacter.TARTAGLIA) ?? null;
    expect(CharacterCalc.getTotalXtraTalentLv({ char, appChar, talentType: "NAs", partyData: [Tartaglia] })).toEqual(1);
  });
});

test("getFinalTalentLv", () => {
  expect(CharacterCalc.getFinalTalentLv({ char, appChar, talentType: "NAs" })).toEqual(char.NAs);
  expect(CharacterCalc.getFinalTalentLv({ char, appChar, talentType: "ES" })).toEqual(char.ES);
  expect(CharacterCalc.getFinalTalentLv({ char, appChar, talentType: "EB" })).toEqual(char.EB);
  expect(CharacterCalc.getFinalTalentLv({ char, appChar, talentType: "altSprint" })).toEqual(0);
});

describe("getTalentMult", () => {
  test("at scale 0", () => {
    expect(CharacterCalc.getTalentMult(0, 10000)).toEqual(1);
  });

  test("at non-existent scale", () => {
    expect(CharacterCalc.getTalentMult(100, 100)).toEqual(0);
  });

  test("at scale 2", () => {
    expect(CharacterCalc.getTalentMult(2, 10)).toEqual(1.8);
  });
});

describe("getLevelScale", () => {
  let info: CalculationInfo;

  beforeEach(() => {
    char.ES = 10;
    info = {
      char,
      appChar,
      partyData: [],
    };
  });

  test("at scale 0, fromSelf", () => {
    expect(CharacterCalc.getLevelScale({ talent: "ES", value: 0 }, info, [], true)).toEqual(char.ES);
  });

  test("at scale 2, fromSelf", () => {
    expect(CharacterCalc.getLevelScale({ talent: "ES", value: 2 }, info, [], true)).toEqual(1.8); // TALENT_LV_MULTIPLIERS[2][char.ES]
  });

  test("at scale 2, not fromSelf, alterIndex default (0)", () => {
    expect(CharacterCalc.getLevelScale({ talent: "ES", value: 2 }, info, [7], false)).toEqual(1.5); // TALENT_LV_MULTIPLIERS[2][7]
  });

  test("at scale 2, not fromSelf, alterIndex 1", () => {
    expect(CharacterCalc.getLevelScale({ talent: "ES", value: 2, alterIndex: 1 }, info, [0, 10], false)).toEqual(1.8); // TALENT_LV_MULTIPLIERS[2][10]
  });
});

describe("getTalentDefaultInfo", () => {
  //
});
