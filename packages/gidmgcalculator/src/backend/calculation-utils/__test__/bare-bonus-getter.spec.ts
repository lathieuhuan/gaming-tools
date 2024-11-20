import { $AppCharacter } from "@Src/services";
import { BareBonusGetter } from "../bare-bonus-getter";
import { characters, EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { genCalculationInfo } from "@UnitTest/test-utils";
import { EntityBonusValueByOption, LevelableTalentType } from "@Src/backend/types";
import { BareBonusGetterTester } from "./test-utils";

let tester: BareBonusGetterTester;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  tester = new BareBonusGetterTester(genCalculationInfo());
});

test("scaleRefi", () => {
  const scaleRefi = tester["scaleRefi"];

  expect(scaleRefi(7, 2, 3)).toBe(7 + 2 * 3);
  expect(scaleRefi(6, 2)).toBe(6 + 2 * (6 / 3));
  expect(scaleRefi(6)).toBe(6);
  expect(scaleRefi(6, undefined, 100)).toBe(6);
});

/**
 * Note: party means partyData only.
 * WHOLE party means the character and partyData.
 */

describe("getIndexOfBonusValue", () => {
  let getIndexOfBonusValue: BareBonusGetter["getIndexOfBonusValue"];

  beforeEach(() => {
    getIndexOfBonusValue = tester["getIndexOfBonusValue"];
  });

  test("DEFAULT: optIndex type INPUT, inpIndex is 0", () => {
    const input = 2;
    expect(getIndexOfBonusValue({}, [input])).toBe(input - 1); // input 1 will be mapped to index 0, etc
    expect(getIndexOfBonusValue({}, [0])).toBe(-1);
    expect(getIndexOfBonusValue({}, [])).toBe(-1);
  });

  test("optIndex config as number: inpIndex to get value from inputs", () => {
    const input = 2;
    expect(getIndexOfBonusValue({ optIndex: 0 }, [input])).toBe(input - 1);
    expect(getIndexOfBonusValue({ optIndex: 1 }, [-2, input])).toBe(input - 1);
    expect(getIndexOfBonusValue({ optIndex: 1 }, [])).toBe(-1);
  });

  test("optIndex from inputs (INPUT)", () => {
    const optIndex: EntityBonusValueByOption["optIndex"] = {
      source: "INPUT",
      inpIndex: 0,
    };
    const input = 2;

    expect(getIndexOfBonusValue({ optIndex }, [input])).toBe(input - 1);
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(-1);
  });

  test("optIndex from character's talent level (LEVEL)", () => {
    const level = 10;
    const talents: LevelableTalentType[] = ["NAs", "ES", "EB"];

    for (const talent of talents) {
      const optIndex: EntityBonusValueByOption["optIndex"] = {
        source: "LEVEL",
        talent: talent,
      };
      tester.updateCharacter(talent, level);

      expect(getIndexOfBonusValue({ optIndex }, [])).toBe(level - 1);
    }
  });

  test("optIndex from the number of WHOLE party's all distinct elements (ELEMENT)", () => {
    const optIndex: EntityBonusValueByOption["optIndex"] = {
      source: "ELEMENT",
    };

    tester.changeCharacter(EMockCharacter.BASIC);
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(0);

    tester.updateParty([$AppCharacter.get(EMockCharacter.BASIC)]);
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(0);

    tester.updateParty([$AppCharacter.get(EMockCharacter.CATALYST)]);
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(1);
  });

  test("optIndex from the number of WHOLE party's some distinct elements (ELEMENT)", () => {
    const optIndex: EntityBonusValueByOption["optIndex"] = {
      source: "ELEMENT",
      elements: ["pyro"],
    };

    tester.changeCharacter(EMockCharacter.BASIC);
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(0);

    tester.updateParty([$AppCharacter.get(EMockCharacter.CATALYST)]);
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(0);

    optIndex.elements = ["pyro", "electro"];
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(1);

    optIndex.elements = ["pyro", "electro", "anemo"];
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(1);
  });

  test("optIndex from the number of party's members whose elements are different from the character (MEMBER)", () => {
    const electroMember = $AppCharacter.get(EMockCharacter.CATALYST);
    const optIndex: EntityBonusValueByOption["optIndex"] = {
      source: "MEMBER",
      element: "DIFFERENT",
    };

    tester.changeCharacter(EMockCharacter.BASIC);
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(-1);

    tester.updateParty([electroMember]);
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(0);

    tester.updateParty([electroMember, $AppCharacter.get(EMockCharacter.BASIC)]);
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(0);

    tester.updateParty([electroMember, $AppCharacter.get(EMockCharacter.TARTAGLIA)]);
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(1);
  });

  test("optIndex from the number of WHOLE party's members whose elements are aligned with the condition (MEMBER)", () => {
    const optIndex: EntityBonusValueByOption["optIndex"] = {
      source: "MEMBER",
      element: "pyro",
    };

    tester.changeCharacter(EMockCharacter.BASIC);
    expect(getIndexOfBonusValue({ optIndex }, [])).toBe(0);
  });
});
