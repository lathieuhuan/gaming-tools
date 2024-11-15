import { AppCharacter, AttackPattern, CalculationInfo, TalentType } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { Character } from "@Src/types";
import { characters, EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { CharacterCalc } from "../character-calc";

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
        expect(CharacterCalc.getTotalXtraTalentLv({ char, appChar, talentType: expectTypes[i] })).toBe(expectValue);
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
    ).toBe(1);
  });

  test("total extra NAs level when Tartaglia is in party", () => {
    const Tartaglia = characters.find((character) => character.name === EMockCharacter.TARTAGLIA) ?? null;
    expect(CharacterCalc.getTotalXtraTalentLv({ char, appChar, talentType: "NAs", partyData: [Tartaglia] })).toBe(1);
  });
});

test("getFinalTalentLv", () => {
  expect(CharacterCalc.getFinalTalentLv({ char, appChar, talentType: "NAs" })).toBe(char.NAs);
  expect(CharacterCalc.getFinalTalentLv({ char, appChar, talentType: "ES" })).toBe(char.ES);
  expect(CharacterCalc.getFinalTalentLv({ char, appChar, talentType: "EB" })).toBe(char.EB);
  expect(CharacterCalc.getFinalTalentLv({ char, appChar, talentType: "altSprint" })).toBe(0);
});

describe("getTalentMult", () => {
  test("at scale 0", () => {
    expect(CharacterCalc.getTalentMult(0, 10000)).toBe(1);
  });

  test("at non-existent scale", () => {
    expect(CharacterCalc.getTalentMult(100, 100)).toBe(0);
  });

  test("at scale 2", () => {
    expect(CharacterCalc.getTalentMult(2, 10)).toBe(1.8);
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
    expect(CharacterCalc.getLevelScale({ talent: "ES", value: 0 }, info, [], true)).toBe(char.ES);
  });

  test("at scale 2, fromSelf", () => {
    expect(CharacterCalc.getLevelScale({ talent: "ES", value: 2 }, info, [], true)).toBe(1.8); // TALENT_LV_MULTIPLIERS[2][char.ES]
  });

  test("at scale 2, not fromSelf, alterIndex default (0)", () => {
    expect(CharacterCalc.getLevelScale({ talent: "ES", value: 2 }, info, [7], false)).toBe(1.5); // TALENT_LV_MULTIPLIERS[2][7]
  });

  test("at scale 2, not fromSelf, alterIndex 1", () => {
    expect(CharacterCalc.getLevelScale({ talent: "ES", value: 2, alterIndex: 1 }, info, [0, 10], false)).toBe(1.8); // TALENT_LV_MULTIPLIERS[2][10]
  });
});

describe("getTalentDefaultInfo", () => {
  function _expect(
    expectedAttPatt: AttackPattern,
    resultKey: keyof ReturnType<typeof CharacterCalc.getTalentDefaultInfo>,
    expectValue: unknown,
    thisAppChar = appChar
  ) {
    expect(CharacterCalc.getTalentDefaultInfo(expectedAttPatt, thisAppChar)[resultKey]).toBe(expectValue);
  }

  test("resultKey should be the same as expected AttackPattern when ES/EB is expected", () => {
    _expect("ES", "resultKey", "ES");
    _expect("EB", "resultKey", "EB");
  });

  test("resultKey should be NAs when expected AttackPattern is other than ES/EB", () => {
    const attPatts: AttackPattern[] = ["NA", "CA", "PA"];

    for (const attPatt of attPatts) {
      _expect(attPatt, "resultKey", "NAs");
    }
  });

  test("defaultBasedOn should be atk", () => {
    _expect("NA", "defaultBasedOn", "atk");
  });

  test("defaultAttPatt should be the same as expected first parameter", () => {
    const attPatts: AttackPattern[] = ["NA", "CA", "PA", "ES", "EB"];

    for (const attPatt of attPatts) {
      _expect(attPatt, "defaultAttPatt", attPatt);
    }
  });

  test("defaultScale of NA, CA, PA on non-catalyst wielder should be 7", () => {
    const attPatts: AttackPattern[] = ["NA", "CA", "PA"];

    for (const attPatt of attPatts) {
      _expect(attPatt, "defaultScale", 7);
    }
  });

  test("defaultScale of any AttackPattern on catalyst wielder, or of ES/EB on other weapons wielder should be 2", () => {
    const attPatts: AttackPattern[] = ["NA", "CA", "PA", "ES", "EB"];
    const catalystWielder = $AppCharacter.get(EMockCharacter.CATALYST);

    for (const attPatt of attPatts) {
      _expect(attPatt, "defaultScale", 2, catalystWielder);
    }

    _expect("ES", "defaultScale", 2);
    _expect("EB", "defaultScale", 2);
  });

  test("talentDefaultInfo should be as declared if there is one", () => {
    const esCalcConfig = $AppCharacter.get(EMockCharacter.ES_CALC_CONFIG);
    const result = CharacterCalc.getTalentDefaultInfo("ES", esCalcConfig);
    const { ES } = esCalcConfig.calcListConfig || {};
    
    expect(result.defaultScale).toBe(ES?.scale);
    expect(result.defaultBasedOn).toBe(ES?.basedOn);
    expect(result.defaultAttPatt).toBe(ES?.attPatt);
  });
});
