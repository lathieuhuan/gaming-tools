import { TotalAttributeControl } from "../../TotalAttributeControl";
import { EffectDynamicMax } from "@Src/calculation/types";
import { __genCharacterDataTester } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "./test-utils";

class Tester extends BareBonusGetterTester {
  config: EffectDynamicMax = {
    value: 10,
  };
  basedOnStable?: boolean;
  refi?: number;

  _applyMax(...args: Parameters<typeof this.applyMax>) {
    return this.applyMax(...args);
  }

  _expect(value: number) {
    expect(
      this.applyMax(1000_000_000, this.config, {
        inputs: this.inputs,
        fromSelf: this.fromSelf,
        basedOnStable: this.basedOnStable,
        refi: this.refi,
      })
    ).toBe(value);
  }
}

let totalAttrCtrl: TotalAttributeControl;
let tester: Tester;

beforeEach(() => {
  totalAttrCtrl = new TotalAttributeControl();
  tester = new Tester(__genCharacterDataTester(), totalAttrCtrl);
});

test("max config as number", () => {
  const value = 100;
  const max = 9;
  const refi = 2;
  const incre = 5;
  const dummies: { inputs: number[]; fromSelf: boolean } = {
    inputs: [],
    fromSelf: true,
  };

  expect(tester._applyMax(value, max)).toBe(max);

  expect(
    tester._applyMax(value, max, {
      ...dummies,
      refi,
    })
  ).toBe(max + (max / 3) * refi);

  expect(
    tester._applyMax(
      value,
      {
        value: max,
        incre,
      },
      {
        ...dummies,
        refi,
      }
    )
  ).toBe(max + incre * refi);
});

test("max is based on inputs", () => {
  const input = 10;

  tester.config = {
    value: 100,
    basedOn: {
      // field here is unused
      field: "atk",
      altIndex: 1,
    },
  };
  tester.inputs = [-2, input];
  tester.fromSelf = false;

  tester._expect(tester.config.value * input);
});

test("max is based on TotalAttribute", () => {
  const attributeType = "atk";

  totalAttrCtrl.applyBonuses({
    value: 1000,
    toStat: attributeType,
    description: "",
  });

  tester.config = {
    value: 2,
    basedOn: {
      field: attributeType,
    },
  };
  tester.fromSelf = true;
  tester._expect(tester.config.value * totalAttrCtrl.getTotal(attributeType));
});

test("max has extra", () => {
  tester.config = {
    value: 2,
    extras: {
      value: 1,
    },
  };
  tester._expect(3);

  tester.config = {
    value: 3,
    extras: {
      value: 1,
      grantedAt: "C2",
    },
  };
  tester._expect(3);

  tester.__updateCharacter("cons", 5);
  tester._expect(4);
});

test("max increased based on refi", () => {
  tester.config = {
    value: 6,
  };
  tester.refi = 1;
  tester._expect(6 + (6 / 3) * tester.refi);

  tester.config = {
    value: 6,
    incre: 3,
  };
  tester.refi = 3;
  tester._expect(6 + 3 * tester.refi);
});
