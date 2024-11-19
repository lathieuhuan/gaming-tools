import { $AppCharacter } from "@Src/services";
import { characters, EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { IsApplicableEffectTester } from "./test-utils";

let tester: IsApplicableEffectTester;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  tester = new IsApplicableEffectTester();
});

describe("condition: checkInput", () => {
  test("checkInput config as number", () => {
    tester.checkInput = 2;

    tester.expectWithInputs([tester.checkInputValue]).toBe(true);
    tester.expectWithInputs([tester.checkInputValue + 1]).toBe(false);
  });

  test("checkInput config as object with only value", () => {
    tester.checkInput = {
      value: 2,
    };
    tester.expectWithInputs([tester.checkInputValue]).toBe(true);
    tester.expectWithInputs([tester.checkInputValue + 1]).toBe(false);
  });

  test("checkInput config as object with value and inpIndex", () => {
    tester.checkInput = {
      value: 2,
      inpIndex: 1,
    };
    tester.expectWithInputs([-1, tester.checkInputValue]).toBe(true);
    tester.expectWithInputs([tester.checkInputValue, 6]).toBe(false);
    tester.expectWithInputs([3, tester.checkInputValue + 1]).toBe(false);
  });

  test("checkInput config as object with value and compare MIN", () => {
    tester.checkInput = {
      value: 2,
      comparison: "MIN",
    };
    tester.expectWithInputs([tester.checkInputValue]).toBe(true);
    tester.expectWithInputs([tester.checkInputValue + 1]).toBe(true);
    tester.expectWithInputs([tester.checkInputValue - 1]).toBe(false);
  });

  test("checkInput config as object with value and compare MAX", () => {
    tester.checkInput = {
      value: 2,
      comparison: "MAX",
    };
    tester.expectWithInputs([tester.checkInputValue]).toBe(true);
    tester.expectWithInputs([tester.checkInputValue + 1]).toBe(false);
    tester.expectWithInputs([tester.checkInputValue - 1]).toBe(true);
  });

  test("checkInput config as object with value, inpIndex, and compare MIN", () => {
    tester.checkInput = {
      value: 2,
      inpIndex: 1,
      comparison: "MIN",
    };
    tester.expectWithInputs([-2, tester.checkInputValue]).toBe(true);
    tester.expectWithInputs([-4, tester.checkInputValue + 1]).toBe(true);
    tester.expectWithInputs([-6, tester.checkInputValue - 1]).toBe(false);
    tester.expectWithInputs([tester.checkInputValue]).toBe(false);
  });
});

describe("condition: checkParty", () => {
  test("check 'DISTINCT_ELMT', compare EQUAL", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
    };

    tester.setInfo(EMockCharacter.BASIC);
    tester.expect().toBe(false);

    tester.setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester.expect().toBe(true);

    tester.setInfo(EMockCharacter.BASIC, [
      $AppCharacter.get(EMockCharacter.CATALYST),
      $AppCharacter.get(EMockCharacter.TARTAGLIA),
    ]);
    tester.expect().toBe(false);
  });

  test("check 'DISTINCT_ELMT', compare MIN", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
      comparison: "MIN",
    };

    tester.setInfo(EMockCharacter.BASIC);
    tester.expect().toBe(false);

    tester.setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester.expect().toBe(true);

    tester.setInfo(EMockCharacter.BASIC, [
      $AppCharacter.get(EMockCharacter.CATALYST),
      $AppCharacter.get(EMockCharacter.TARTAGLIA),
    ]);
    tester.expect().toBe(true);
  });

  test("check 'DISTINCT_ELMT', compare MAX", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
      comparison: "MAX",
    };

    tester.setInfo(EMockCharacter.BASIC);
    tester.expect().toBe(true);

    tester.setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester.expect().toBe(true);

    tester.setInfo(EMockCharacter.BASIC, [
      $AppCharacter.get(EMockCharacter.CATALYST),
      $AppCharacter.get(EMockCharacter.TARTAGLIA),
    ]);
    tester.expect().toBe(false);
  });

  // check 'MIXED' manually
});

describe("condition: forElmts", () => {
  test("app character element type", () => {
    tester.forElmts = ["pyro"];

    tester.setInfo(EMockCharacter.BASIC);
    tester.expect().toBe(true);

    tester.setInfo(EMockCharacter.CATALYST);
    tester.expect().toBe(false);

    tester.forElmts = ["pyro", "electro"];

    tester.setInfo(EMockCharacter.BASIC);
    tester.expect().toBe(true);

    tester.setInfo(EMockCharacter.CATALYST);
    tester.expect().toBe(true);
  });
});

describe("condition: forElmts", () => {
  test("app character weapon type", () => {
    tester.forWeapons = ["sword"];

    tester.setInfo(EMockCharacter.BASIC);
    tester.expect().toBe(true);

    tester.setInfo(EMockCharacter.CATALYST);
    tester.expect().toBe(false);

    tester.forWeapons = ["sword", "catalyst"];

    tester.setInfo(EMockCharacter.BASIC);
    tester.expect().toBe(true);

    tester.setInfo(EMockCharacter.CATALYST);
    tester.expect().toBe(true);
  });
});

// describe("condition: partyOnlyElmts", () => {
// });
