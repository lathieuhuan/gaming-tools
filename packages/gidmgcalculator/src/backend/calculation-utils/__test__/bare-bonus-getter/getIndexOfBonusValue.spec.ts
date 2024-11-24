import { EntityBonusValueByOption, LevelableTalentType } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { characters, EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { genCalculationInfo } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "../test-utils";

class Tester extends BareBonusGetterTester {
  optIndex: EntityBonusValueByOption["optIndex"];

  expect(value: number) {
    expect(this.getIndexOfBonusValue({ optIndex: this.optIndex }, this.inputs)).toBe(value);
  }
}

let tester: Tester;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  tester = new Tester(genCalculationInfo());
});

/**
 * @inpIndex the index of inputs to get value, when optIndex type INPUT
 */

test("[DEFAULT] no optIndex: type INPUT, inpIndex is 0", () => {
  const input = 2;
  tester.inputs = [input];
  tester.optIndex = undefined;

  tester.expect(input - 1); // input 1 will be mapped to index 0, input 2 mapped to index 1, etc
});

test("optIndex config as number: type INPUT, optIndex is the inpIndex", () => {
  const input = 2;

  tester.optIndex = 0;
  tester.inputs = [input];
  tester.expect(input - 1);

  tester.optIndex = 1;
  tester.inputs = [-2, input];
  tester.expect(input - 1);

  tester.optIndex = 1;
  tester.inputs = [];
  tester.expect(-1);
});

test("[type: INPUT] get optIndex from inputs", () => {
  const input = 2;

  tester.optIndex = {
    source: "INPUT",
    inpIndex: 0,
  };

  tester.inputs = [input];
  tester.expect(input - 1);

  tester.inputs = [];
  tester.expect(-1);
});

test("[type: LEVEL] get optIndex from character's talent level", () => {
  const level = 10;
  const talents: LevelableTalentType[] = ["NAs", "ES", "EB"];

  for (const talent of talents) {
    tester.optIndex = {
      source: "LEVEL",
      talent: talent,
    };
    tester.updateCharacter(talent, level);
    tester.expect(level - 1);
  }
});

test("[type: ELEMENT] get optIndex from the number of the party's all distinct elements", () => {
  tester.optIndex = {
    source: "ELEMENT",
  };

  tester.changeCharacter(EMockCharacter.BASIC);
  tester.expect(0);

  tester.changeParty([$AppCharacter.get(EMockCharacter.BASIC)]);
  tester.expect(0);

  tester.changeParty([$AppCharacter.get(EMockCharacter.CATALYST)]);
  tester.expect(1);
});

test("[type: ELEMENT] get optIndex from the number of the party's some distinct elements (ELEMENT)", () => {
  tester.optIndex = {
    source: "ELEMENT",
    elements: ["pyro"],
  };

  tester.changeCharacter(EMockCharacter.BASIC);
  tester.expect(0);

  tester.changeParty([$AppCharacter.get(EMockCharacter.CATALYST)]);
  tester.expect(0);

  tester.optIndex.elements = ["pyro", "electro"];
  tester.expect(1);

  tester.optIndex.elements = ["pyro", "electro", "anemo"];
  tester.expect(1);
});

test("[type: MEMBER] get optIndex from the number of teammates whose elements are different from the character", () => {
  const electroMember = $AppCharacter.get(EMockCharacter.CATALYST);

  tester.optIndex = {
    source: "MEMBER",
    element: "DIFFERENT",
  };

  tester.changeCharacter(EMockCharacter.BASIC);
  tester.expect(-1);

  tester.changeParty([electroMember]);
  tester.expect(0);

  tester.changeParty([electroMember, $AppCharacter.get(EMockCharacter.BASIC)]);
  tester.expect(0);

  tester.changeParty([electroMember, $AppCharacter.get(EMockCharacter.TARTAGLIA)]);
  tester.expect(1);
});

test("optIndex from the number of WHOLE party's members whose elements are aligned with the condition (MEMBER)", () => {
  const electroMember = $AppCharacter.get(EMockCharacter.CATALYST);
  const pyroMember = $AppCharacter.get(EMockCharacter.BASIC);

  tester.optIndex = {
    source: "MEMBER",
    element: "pyro",
  };

  tester.changeCharacter(EMockCharacter.BASIC);
  tester.expect(0);

  tester.changeParty([pyroMember]);
  tester.expect(1);

  tester.changeParty([pyroMember, electroMember]);
  tester.expect(1);

  tester.optIndex.element = ["pyro", "electro"];
  tester.expect(2);
});
