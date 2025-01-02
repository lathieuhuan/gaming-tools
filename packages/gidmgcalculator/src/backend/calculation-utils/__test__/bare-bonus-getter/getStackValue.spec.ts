import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genCharacterDataTester } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "../test-utils";
import { EntityBonusStack } from "@Src/backend/types";

class Tester extends BareBonusGetterTester {
  stack: EntityBonusStack = {
    type: "INPUT",
  };

  _expect(stackValue: number) {
    expect(
      this.getStackValue(this.stack, {
        inputs: this.inputs,
        fromSelf: this.fromSelf,
      })
    ).toBe(stackValue);
  }
}

let tester: Tester;

beforeEach(() => {
  tester = new Tester(__genCharacterDataTester());
});

test("stack be 0 when stack calculation is involved party and there's no party", () => {
  // ELEMENT

  tester.stack = {
    type: "MEMBER",
    element: "DIFFERENT",
  };
  tester._expect(0);

  tester.stack = {
    type: "MEMBER",
    element: "SAME_EXCLUDED",
  };
  tester._expect(0);

  tester.stack = {
    type: "MEMBER",
    element: "SAME_INCLUDED",
  };
  tester._expect(0);

  tester.stack = {
    type: "MEMBER",
    element: "pyro",
  };
  tester._expect(0);

  // ENERGY

  tester.stack = {
    type: "ENERGY",
    scope: "ACTIVE",
  };
  tester._expect(0);

  tester.stack = {
    type: "ENERGY",
    scope: "PARTY",
  };
  tester._expect(0);

  // NATION

  tester.stack = {
    type: "NATION",
    nation: "DIFFERENT",
  };
  tester._expect(0);

  tester.stack = {
    type: "NATION",
    nation: "SAME_EXCLUDED",
  };
  tester._expect(0);

  tester.stack = {
    type: "NATION",
    nation: "LIYUE",
  };
  tester._expect(0);

  // OTHERS

  tester.stack = {
    type: "RESOLVE",
  };
  tester._expect(0);

  tester.stack = {
    type: "MIX",
  };
  tester._expect(0);
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
    tester._expect(10);
  });

  test("fromSelf, index 1", () => {
    tester.stack = {
      type: "INPUT",
      index: 1,
    };
    tester.inputs = [-2, 30];
    tester._expect(30);
  });

  test("not fromSelf, altIndex default to 0", () => {
    tester.fromSelf = false;
    tester.stack = {
      type: "INPUT",
    };
    tester.inputs = [20];
    tester._expect(20);
  });

  test("not fromSelf, altIndex 2", () => {
    tester.fromSelf = false;
    tester.stack = {
      type: "INPUT",
      altIndex: 2,
    };
    tester.inputs = [-4, -1, 15];
    tester._expect(15);
  });
});

describe("type MEMBER: stack calculated from inputs", () => {
  test("element DIFFERENT", () => {
    tester.stack = {
      type: "MEMBER",
      element: "DIFFERENT",
    };

    tester.__changeCharacter(__EMockCharacter.BASIC);
    tester._expect(0);

    tester.__changeParty([__EMockCharacter.BASIC]);
    tester._expect(0);

    tester.__changeParty([__EMockCharacter.CATALYST]);

    tester._expect(1);
  });
});
