import { EffectInputCondition } from "@Src/calculation/types";
import { isValidInput } from "../isValidInput";

describe("isValidInput", () => {
  let inputCheck: EffectInputCondition | undefined;

  const __expectInputs = (inputs: number[]) => {
    return expect(isValidInput(inputCheck, inputs));
  };

  beforeEach(() => {
    // tester = __genMutableTeamDataTester();
    inputCheck = undefined;
  });

  test("DEFAULT: only config value, inpIndex default to 0, comparison default to EQUAL", () => {
    inputCheck = 2;
    __expectInputs([2]).toBe(true);
    __expectInputs([inputCheck + 1]).toBe(false);

    inputCheck = {
      value: 3,
    };
    __expectInputs([3]).toBe(true);
    // __expectInputs([inputCheck.value + 1]).toBe(false);
  });

  test("checkInput config with value and inpIndex", () => {
    inputCheck = {
      value: 2,
      inpIndex: 1,
    };
    __expectInputs([-1, inputCheck.value]).toBe(true);
    __expectInputs([inputCheck.value, 6]).toBe(false);
    __expectInputs([3, inputCheck.value + 1]).toBe(false);
  });

  test("checkInput config with value and comparison MIN", () => {
    inputCheck = {
      value: 2,
      comparison: "MIN",
    };
    __expectInputs([inputCheck.value]).toBe(true);
    __expectInputs([inputCheck.value + 1]).toBe(true);
    __expectInputs([inputCheck.value - 1]).toBe(false);
  });

  test("checkInput config with value and comparison MAX", () => {
    inputCheck = {
      value: 2,
      comparison: "MAX",
    };
    __expectInputs([inputCheck.value]).toBe(true);
    __expectInputs([inputCheck.value + 1]).toBe(false);
    __expectInputs([inputCheck.value - 1]).toBe(true);
  });

  test("checkInput config with value, inpIndex, and comparison MIN", () => {
    inputCheck = {
      value: 2,
      inpIndex: 1,
      comparison: "MIN",
    };
    __expectInputs([-2, inputCheck.value]).toBe(true);
    __expectInputs([-4, inputCheck.value + 1]).toBe(true);
    __expectInputs([-6, inputCheck.value - 1]).toBe(false);
    __expectInputs([inputCheck.value]).toBe(false);
  });
});
