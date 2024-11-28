import { EntityPenaltyCore } from "@Src/backend/types";
import { getPenaltyValue } from "../getPenaltyValue";
import { __genCalculationInfo } from "@UnitTest/test-utils";

class Tester {
  info = __genCalculationInfo();
  inputs: number[] = [];
  fromSelf = true;
  config: EntityPenaltyCore = {
    value: 0,
  };

  _expect(value: number) {
    expect(getPenaltyValue(this.config, this.info, this.inputs, this.fromSelf)).toBe(value);
  }
}

let tester: Tester;

beforeEach(() => {
  tester = new Tester();
});

test("config with only value", () => {
  tester.config.value = 10;
  tester._expect(10);
});

test("penalty scale with level", () => {
  tester.info.char.ES = 10;
  tester.config = {
    value: 2,
    lvScale: {
      value: 0,
      talent: "ES",
    },
  };
  tester._expect(2 * 10);
});

test("penalty has preExtra", () => {
  tester.config = {
    value: 2,
    preExtra: 3,
  };
  tester._expect(2 + 3);

  tester.config = {
    value: 2,
    preExtra: {
      value: 4,
      grantedAt: "C1",
    },
  };
  tester._expect(2);

  tester.info.char.cons = 1;
  tester._expect(2 + 4);
});

test("penalty has max", () => {
  tester.config = {
    value: 2,
    preExtra: {
      value: 4,
      grantedAt: "C1",
    },
    max: 5,
  };
  tester._expect(2);

  tester.info.char.cons = 1;
  tester._expect(5);
});
