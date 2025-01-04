import { AppCharacter, AttackPattern } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genCharacterDataTester } from "@UnitTest/test-utils";
import { CharacterCalc } from "../character-calc";

let appCharacter: AppCharacter;

beforeEach(() => {
  appCharacter = __genCharacterDataTester().appCharacter;
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
