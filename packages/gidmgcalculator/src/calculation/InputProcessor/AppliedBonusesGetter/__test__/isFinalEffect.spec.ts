import { EntityBonusBasedOn, EntityBonusEffect } from "@Src/calculation/types";
import { __genMutableTeamDataTester } from "@UnitTest/test-utils";
import { AppliedBonusesGetter } from "../AppliedBonusesGetter";

class Tester extends AppliedBonusesGetter {}

let tester: Tester;

beforeEach(() => {
  tester = new Tester(true, __genMutableTeamDataTester());
});

test("isFinalEffect", () => {
  const isFinalEffect = tester["isFinalEffect"];
  const basedOnFieldsMakingFinalBonus: EntityBonusBasedOn[] = ["hp", "atk", "def", "em", "er_", "healB_"];

  expect(isFinalEffect()).toBe(false);
  expect(isFinalEffect("base_atk")).toBe(false);

  for (const field of basedOnFieldsMakingFinalBonus) {
    expect(isFinalEffect(field)).toBe(true);
  }
});

test("isTrulyFinalEffect", () => {
  const isTrulyFinalEffect = tester["isTrulyFinalEffect"];
  const basedOnFieldsMakingFinalBonus: EntityBonusBasedOn[] = ["hp", "atk", "def", "em", "er_", "healB_"];

  const config: EntityBonusEffect = {
    id: "",
    value: 2,
  };
  expect(isTrulyFinalEffect(config)).toBe(false);

  config.basedOn = "base_atk";
  expect(isTrulyFinalEffect(config)).toBe(false);

  for (const field of basedOnFieldsMakingFinalBonus) {
    config.basedOn = field;
    expect(isTrulyFinalEffect(config)).toBe(true);
  }

  // Reset basedOn
  config.basedOn = undefined;
  expect(isTrulyFinalEffect(config)).toBe(false);

  config.preExtra = {
    id: "",
    value: 3,
    basedOn: "base_atk",
  };
  expect(isTrulyFinalEffect(config)).toBe(false);

  for (const field of basedOnFieldsMakingFinalBonus) {
    config.preExtra = {
      id: "",
      value: 3,
      basedOn: field,
    };
    expect(isTrulyFinalEffect(config)).toBe(true);
  }
});
