import { AppCharacter, AttackPattern, TalentType } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { Character } from "@Src/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genCalculationInfo } from "@UnitTest/test-utils";
import { CharacterCalc } from "../character-calc";

type GetTotalXtraTalentLvTestCase = {
  constellation: number;
  /** [NAs, ES, EB] */
  expect: [number, number, number];
};

let character: Character;
let appCharacter: AppCharacter;
let record: ReturnType<typeof __genCalculationInfo>;

beforeEach(() => {
  record = __genCalculationInfo();
  character = record.character;
  appCharacter = record.appCharacter;
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
      character.cons = testCase.constellation;

      testCase.expect.forEach((expectValue, i) => {
        expect(record.getTotalXtraTalentLv(expectTypes[i])).toBe(expectValue);
      });
    });
  });

  test("total extra NAs level of Tartaglia", () => {
    record.__updateCharacter(__EMockCharacter.TARTAGLIA);

    expect(record.getTotalXtraTalentLv("NAs")).toBe(1);
  });

  test("total extra NAs level when Tartaglia is in party", () => {
    const Tartaglia = $AppCharacter.get(__EMockCharacter.TARTAGLIA);

    record.__updateParty([Tartaglia]);
    expect(record.getTotalXtraTalentLv("NAs")).toBe(1);
  });
});

test("getFinalTalentLv", () => {
  expect(record.getFinalTalentLv("NAs")).toBe(character.NAs);
  expect(record.getFinalTalentLv("ES")).toBe(character.ES);
  expect(record.getFinalTalentLv("EB")).toBe(character.EB);
  expect(record.getFinalTalentLv("altSprint")).toBe(0);
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
  beforeEach(() => {
    character.ES = 10;
  });

  test("at scale 0, fromSelf", () => {
    expect(record.getLevelScale({ talent: "ES", value: 0 }, [], true)).toBe(character.ES);
  });

  test("at scale 2, fromSelf", () => {
    expect(record.getLevelScale({ talent: "ES", value: 2 }, [], true)).toBe(1.8); // TALENT_LV_MULTIPLIERS[2][character.ES]
  });

  test("at scale 2, not fromSelf, altIndex default (0)", () => {
    expect(record.getLevelScale({ talent: "ES", value: 2 }, [7], false)).toBe(1.5); // TALENT_LV_MULTIPLIERS[2][7]
  });

  test("at scale 2, not fromSelf, altIndex 1", () => {
    expect(record.getLevelScale({ talent: "ES", value: 2, altIndex: 1 }, [0, 10], false)).toBe(1.8); // TALENT_LV_MULTIPLIERS[2][10]
  });
});

describe("getTalentDefaultInfo", () => {
  function _expect(
    expectedAttPatt: AttackPattern,
    resultKey: keyof ReturnType<typeof CharacterCalc.getTalentDefaultInfo>,
    expectValue: unknown,
    thisAppChar = appCharacter
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

  test("default BasedOn should be atk", () => {
    _expect("NA", "basedOn", "atk");
  });

  test("default AttPatt should be the same as expected first parameter", () => {
    const attPatts: AttackPattern[] = ["NA", "CA", "PA", "ES", "EB"];

    for (const attPatt of attPatts) {
      _expect(attPatt, "attPatt", attPatt);
    }
  });

  test("default scale of NA, CA, PA on non-catalyst wielder should be 7", () => {
    const attPatts: AttackPattern[] = ["NA", "CA", "PA"];

    for (const attPatt of attPatts) {
      _expect(attPatt, "scale", 7);
    }
  });

  test("default scale of any AttackPattern on catalyst wielder, or of ES/EB on other weapons wielder should be 2", () => {
    const attPatts: AttackPattern[] = ["NA", "CA", "PA", "ES", "EB"];
    const catalystWielder = $AppCharacter.get(__EMockCharacter.CATALYST);

    for (const attPatt of attPatts) {
      _expect(attPatt, "scale", 2, catalystWielder);
    }

    _expect("ES", "scale", 2);
    _expect("EB", "scale", 2);
  });

  test("talentDefaultInfo should be as declared if there is one", () => {
    const esCalcConfig = $AppCharacter.get(__EMockCharacter.ES_CALC_CONFIG);
    const result = CharacterCalc.getTalentDefaultInfo("ES", esCalcConfig);
    const { ES } = esCalcConfig.calcListConfig || {};

    expect(result.scale).toBe(ES?.scale);
    expect(result.basedOn).toBe(ES?.basedOn);
    expect(result.attPatt).toBe(ES?.attPatt);
  });
});
