import { EntityBonusStack } from "@Src/calculation/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genMutableTeamDataTester } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "./test-utils";

class Tester extends BareBonusGetterTester {
  stack: EntityBonusStack = {
    type: "INPUT",
  };

  __expect(stackValue: number) {
    expect(
      this.getStackValue(this.stack, {
        inputs: this.inputs,
      })
    ).toBe(stackValue);
  }
}

let tester: Tester;

beforeEach(() => {
  tester = new Tester(__genMutableTeamDataTester());
});

test("stack be 0 when stack calculation is involved team and there's no team", () => {
  // ELEMENT

  tester.stack = {
    type: "MEMBER",
    element: "DIFFERENT",
  };
  tester.__expect(0);

  tester.stack = {
    type: "MEMBER",
    element: "SAME_EXCLUDED",
  };
  tester.__expect(0);

  tester.stack = {
    type: "MEMBER",
    element: "SAME_INCLUDED",
  };
  tester.__expect(0);

  tester.stack = {
    type: "MEMBER",
    element: "pyro",
  };
  tester.__expect(0);

  // ENERGY

  tester.stack = {
    type: "ENERGY",
    scope: "ACTIVE",
  };
  tester.__expect(0);

  tester.stack = {
    type: "ENERGY",
    scope: "PARTY",
  };
  tester.__expect(0);

  // NATION

  tester.stack = {
    type: "NATION",
    nation: "DIFFERENT",
  };
  tester.__expect(0);

  tester.stack = {
    type: "NATION",
    nation: "SAME_EXCLUDED",
  };
  tester.__expect(0);

  tester.stack = {
    type: "NATION",
    nation: "LIYUE",
  };
  tester.__expect(0);

  // OTHERS

  tester.stack = {
    type: "RESOLVE",
  };
  tester.__expect(0);

  tester.stack = {
    type: "MIX",
  };
  tester.__expect(0);
});

describe("type INPUT: stack calculated from inputs", () => {
  beforeEach(() => {
    tester.__changeFromSelf(true);
  });

  test("fromSelf, index default to 0", () => {
    tester.stack = {
      type: "INPUT",
    };
    tester.inputs = [10];
    tester.__expect(10);
  });

  test("fromSelf, index 1", () => {
    tester.stack = {
      type: "INPUT",
      index: 1,
    };
    tester.inputs = [-2, 30];
    tester.__expect(30);
  });

  test("not fromSelf, altIndex default to 0", () => {
    tester.__changeFromSelf(false);
    tester.stack = {
      type: "INPUT",
    };
    tester.inputs = [20];
    tester.__expect(20);
  });

  test("not fromSelf, altIndex 2", () => {
    tester.__changeFromSelf(false);
    tester.stack = {
      type: "INPUT",
      altIndex: 2,
    };
    tester.inputs = [-4, -1, 15];
    tester.__expect(15);
  });
});

describe("type MEMBER: stack calculated from inputs", () => {
  test("element DIFFERENT", () => {
    tester.stack = {
      type: "MEMBER",
      element: "DIFFERENT",
    };

    tester.__changeActiveMember(__EMockCharacter.BASIC);
    tester.__expect(0);

    tester.__changeTeammates([__EMockCharacter.BASIC]);
    tester.__expect(0);

    tester.__changeTeammates([__EMockCharacter.CATALYST]);

    tester.__expect(1);
  });
});
