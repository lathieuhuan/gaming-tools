import { TotalAttributeControl } from "@Src/backend/controls";
import { EffectDynamicMax } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { characters } from "@UnitTest/mocks/characters.mock";
import { genCalculationInfo } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "../test-utils";

class Tester extends BareBonusGetterTester {
  config: EffectDynamicMax = {
    value: 10,
  };
  basedOnStable?: boolean;
  refi?: number;

  expect(value: number) {
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

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  totalAttrCtrl = new TotalAttributeControl();
  tester = new Tester(genCalculationInfo(), totalAttrCtrl);
});

test("max config as number", () => {
  expect(tester["applyMax"](17, 10)).toBe(10);
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

  tester.expect(tester.config.value * input);
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
  tester.expect(tester.config.value * totalAttrCtrl.getTotal(attributeType));
});

test("max has extra", () => {
  tester.config = {
    value: 2,
    extras: {
      value: 1,
    },
  };
  tester.expect(3);

  tester.config = {
    value: 3,
    extras: {
      value: 1,
      grantedAt: "C2",
    },
  };
  tester.expect(3);

  tester.updateCharacter("cons", 5);
  tester.expect(4);
});

test("max increased based on refi", () => {
  tester.config = {
    value: 6,
  };
  tester.refi = 1;
  tester.expect(6 + (6 / 3) * tester.refi);

  tester.config = {
    value: 6,
    incre: 3,
  };
  tester.refi = 3;
  tester.expect(6 + 3 * tester.refi);
});
