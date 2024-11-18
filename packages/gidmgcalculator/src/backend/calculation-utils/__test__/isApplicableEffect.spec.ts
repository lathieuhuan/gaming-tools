import { $AppCharacter } from "@Src/services";
import { characters } from "@UnitTest/mocks/characters.mock";
import { Operator } from "./test-utils";

let operator: Operator;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  operator = new Operator();
});

describe("checkInput condition", () => {
  test("checkInput from inputs", () => {
    operator.checkInput = 2;
    operator.expectWithInputs([operator.checkInputValue]).toBe(true);
    operator.expectWithInputs([operator.checkInputValue + 1]).toBe(false);

    operator.checkInput = {
      value: 2,
    };
    operator.expectWithInputs([operator.checkInputValue]).toBe(true);
    operator.expectWithInputs([operator.checkInputValue + 1]).toBe(false);

    operator.checkInput = {
      value: 2,
      source: 1,
    };
    operator.expectWithInputs([-1, operator.checkInputValue]).toBe(true);
    operator.expectWithInputs([operator.checkInputValue, 6]).toBe(false);
    operator.expectWithInputs([3, operator.checkInputValue + 1]).toBe(false);

    operator.checkInput = {
      value: 2,
      type: "min",
    };
    operator.expectWithInputs([operator.checkInputValue]).toBe(true);
    operator.expectWithInputs([operator.checkInputValue + 1]).toBe(true);
    operator.expectWithInputs([operator.checkInputValue - 1]).toBe(false);

    operator.checkInput = {
      value: 2,
      type: "max",
    };
    operator.expectWithInputs([operator.checkInputValue]).toBe(true);
    operator.expectWithInputs([operator.checkInputValue + 1]).toBe(false);
    operator.expectWithInputs([operator.checkInputValue - 1]).toBe(true);

    operator.checkInput = {
      value: 2,
      source: 1,
      type: "min",
    };
    operator.expectWithInputs([-2, operator.checkInputValue]).toBe(true);
    operator.expectWithInputs([-4, operator.checkInputValue + 1]).toBe(true);
    operator.expectWithInputs([-6, operator.checkInputValue - 1]).toBe(false);
    operator.expectWithInputs([operator.checkInputValue]).toBe(false);
  });

  // test("checkInput from party's distinct vision type count", () => {
  // });
});
