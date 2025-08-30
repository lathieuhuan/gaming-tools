import { EffectExtra } from "@/calculation/types";
import { __genMutableTeamDataTester } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "./test-utils";

let getExtra: BareBonusGetterTester["getExtra"];

beforeEach(() => {
  getExtra = new BareBonusGetterTester(__genMutableTeamDataTester())["getExtra"];
});

test("getExtra", () => {
  const extraValue = 3;
  const requiredInput = 2;
  const extraConfig: EffectExtra = {
    value: extraValue,
    checkInput: requiredInput,
  };
  let inputs: number[] = [];

  inputs = [requiredInput - 1];
  expect(getExtra(undefined, { inputs, fromSelf: true })).toBe(0);
  expect(getExtra(extraConfig, { inputs, fromSelf: true })).toBe(0);

  inputs = [requiredInput];
  expect(getExtra(extraConfig, { inputs, fromSelf: true })).toBe(extraValue);
});
