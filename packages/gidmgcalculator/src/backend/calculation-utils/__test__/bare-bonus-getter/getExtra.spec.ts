import { EffectExtra } from "@Src/backend/types";
import { __genCalculationInfo } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "../test-utils";

let getExtra: BareBonusGetterTester["getExtra"];

beforeEach(() => {
  getExtra = new BareBonusGetterTester(__genCalculationInfo())["getExtra"];
});

test("getExtra", () => {
  const extraValue = 3;
  const requiredInput = 2;
  const extraConfig: EffectExtra = {
    value: extraValue,
    checkInput: requiredInput,
  };
  const support = {
    inputs: [] as number[],
    fromSelf: true,
  };

  support.inputs = [requiredInput - 1];
  expect(getExtra(undefined, support)).toBe(0);
  expect(getExtra(extraConfig, support)).toBe(0);

  support.inputs = [requiredInput];
  expect(getExtra(extraConfig, support)).toBe(extraValue);
});
