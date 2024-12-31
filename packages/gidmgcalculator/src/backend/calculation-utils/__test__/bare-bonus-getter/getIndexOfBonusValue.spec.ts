import { EntityBonusValueByOption, LevelableTalentType } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genCalculationInfo } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "../test-utils";

class Tester extends BareBonusGetterTester {
  optIndex: EntityBonusValueByOption["optIndex"];

  _expect(value: number) {
    expect(this.getIndexOfBonusValue({ optIndex: this.optIndex }, this.inputs)).toBe(value);
  }
}

let tester: Tester;

beforeEach(() => {
  tester = new Tester(__genCalculationInfo());
});

/**
 * @inpIndex the index of inputs to get value, when optIndex type INPUT
 */

test("[DEFAULT] no optIndex: type INPUT, inpIndex is 0", () => {
  const input = 2;
  tester.inputs = [input];
  tester.optIndex = undefined;

  tester._expect(input - 1); // input 1 will be mapped to index 0, input 2 mapped to index 1, etc
});

test("optIndex config as number: type INPUT, optIndex is the inpIndex", () => {
  const input = 2;

  tester.optIndex = 0;
  tester.inputs = [input];
  tester._expect(input - 1);

  tester.optIndex = 1;
  tester.inputs = [-2, input];
  tester._expect(input - 1);

  tester.optIndex = 1;
  tester.inputs = [];
  tester._expect(-1);
});

test("[type: INPUT] get optIndex from inputs", () => {
  const input = 2;

  tester.optIndex = {
    source: "INPUT",
    inpIndex: 0,
  };

  tester.inputs = [input];
  tester._expect(input - 1);

  tester.inputs = [];
  tester._expect(-1);
});

test("[type: LEVEL] get optIndex from character's talent level", () => {
  const level = 10;
  const talents: LevelableTalentType[] = ["NAs", "ES", "EB"];

  for (const talent of talents) {
    tester.optIndex = {
      source: "LEVEL",
      talent: talent,
    };
    tester.__updateCharacter(talent, level);
    tester._expect(level - 1);
  }
});

test("[type: ELEMENT] get optIndex from the number of the party's all distinct elements", () => {
  tester.optIndex = {
    source: "ELEMENT",
  };

  tester.__changeCharacter(__EMockCharacter.BASIC);
  tester._expect(0);

  tester.__changeParty([$AppCharacter.get(__EMockCharacter.BASIC)]);
  tester._expect(0);

  tester.__changeParty([$AppCharacter.get(__EMockCharacter.CATALYST)]);
  tester._expect(1);
});

test("[type: ELEMENT] get optIndex from the number of the party's some distinct elements (ELEMENT)", () => {
  tester.optIndex = {
    source: "ELEMENT",
    elements: ["pyro"],
  };

  tester.__changeCharacter(__EMockCharacter.BASIC);
  tester._expect(0);

  tester.__changeParty([$AppCharacter.get(__EMockCharacter.CATALYST)]);
  tester._expect(0);

  tester.optIndex.elements = ["pyro", "electro"];
  tester._expect(1);

  tester.optIndex.elements = ["pyro", "electro", "anemo"];
  tester._expect(1);
});

test("[type: MEMBER] get optIndex from the number of teammates whose elements are different from the character", () => {
  const electroMember = $AppCharacter.get(__EMockCharacter.CATALYST);

  tester.optIndex = {
    source: "MEMBER",
    element: "DIFFERENT",
  };

  tester.__changeCharacter(__EMockCharacter.BASIC);
  tester._expect(-1);

  tester.__changeParty([electroMember]);
  tester._expect(0);

  tester.__changeParty([electroMember, $AppCharacter.get(__EMockCharacter.BASIC)]);
  tester._expect(0);

  tester.__changeParty([electroMember, $AppCharacter.get(__EMockCharacter.TARTAGLIA)]);
  tester._expect(1);
});

test("optIndex from the number of WHOLE party's members whose elements are aligned with the condition (MEMBER)", () => {
  const electroMember = $AppCharacter.get(__EMockCharacter.CATALYST);
  const pyroMember = $AppCharacter.get(__EMockCharacter.BASIC);

  tester.optIndex = {
    source: "MEMBER",
    element: "pyro",
  };

  tester.__changeCharacter(__EMockCharacter.BASIC);
  tester._expect(0);

  tester.__changeParty([pyroMember]);
  tester._expect(1);

  tester.__changeParty([pyroMember, electroMember]);
  tester._expect(1);

  tester.optIndex.element = ["pyro", "electro"];
  tester._expect(2);
});
