import { $AppCharacter } from "@Src/services";
import { characters, EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { genCalculationInfo } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "../test-utils";
import { EntityBonusStack } from "@Src/backend/types";

class Tester extends BareBonusGetterTester {
  stack: EntityBonusStack = {
    type: "INPUT",
  };

  expect(stackValue: number) {
    expect(
      this.getStackValue(this.stack, {
        inputs: this.inputs,
        fromSelf: this.fromSelf,
      })
    ).toBe(stackValue);
  }
}

let tester: Tester;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  tester = new Tester(genCalculationInfo());
});

test("stack be 0 when stack calculation is involved party and there's no party", () => {
  // ELEMENT

  tester.stack = {
    type: "MEMBER",
    element: "DIFFERENT",
  };
  tester.expect(0);

  tester.stack = {
    type: "MEMBER",
    element: "SAME_EXCLUDED",
  };
  tester.expect(0);

  tester.stack = {
    type: "MEMBER",
    element: "SAME_INCLUDED",
  };
  tester.expect(0);

  tester.stack = {
    type: "MEMBER",
    element: "pyro",
  };
  tester.expect(0);

  // ENERGY

  tester.stack = {
    type: "ENERGY",
    scope: "ACTIVE",
  };
  tester.expect(0);

  tester.stack = {
    type: "ENERGY",
    scope: "PARTY",
  };
  tester.expect(0);

  // NATION

  tester.stack = {
    type: "NATION",
    nation: "DIFFERENT",
  };
  tester.expect(0);

  tester.stack = {
    type: "NATION",
    nation: "SAME_EXCLUDED",
  };
  tester.expect(0);

  tester.stack = {
    type: "NATION",
    nation: "LIYUE",
  };
  tester.expect(0);

  // OTHERS

  tester.stack = {
    type: "RESOLVE",
  };
  tester.expect(0);

  tester.stack = {
    type: "MIX",
  };
  tester.expect(0);
});

describe("type INPUT: stack calculated from inputs", () => {
  beforeEach(() => {
    tester.fromSelf = true;
  });

  test("fromSelf, index default to 0", () => {
    tester.stack = {
      type: "INPUT",
    };
    tester.inputs = [10];
    tester.expect(10);
  });

  test("fromSelf, index 1", () => {
    tester.stack = {
      type: "INPUT",
      index: 1,
    };
    tester.inputs = [-2, 30];
    tester.expect(30);
  });

  test("not fromSelf, altIndex default to 0", () => {
    tester.fromSelf = false;
    tester.stack = {
      type: "INPUT",
    };
    tester.inputs = [20];
    tester.expect(20);
  });

  test("not fromSelf, altIndex 2", () => {
    tester.fromSelf = false;
    tester.stack = {
      type: "INPUT",
      altIndex: 2,
    };
    tester.inputs = [-4, -1, 15];
    tester.expect(15);
  });
});

describe("type MEMBER: stack calculated from inputs", () => {
  test("element DIFFERENT", () => {
    tester.stack = {
      type: "MEMBER",
      element: "DIFFERENT",
    };

    tester.changeCharacter(EMockCharacter.BASIC);
    tester.expect(0);

    tester.changeParty([$AppCharacter.get(EMockCharacter.BASIC)]);
    tester.expect(0);

    tester.changeParty([$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester.expect(1);
  });
});
