import { EntityBonusBasedOn, EntityBonusCore } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { characters } from "@UnitTest/mocks/characters.mock";
import { genCalculationInfo } from "@UnitTest/test-utils";
import { AppliedBonusesGetter } from "../../applied-bonuses-getter";

class Tester extends AppliedBonusesGetter {}

let tester: Tester;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  tester = new Tester(genCalculationInfo());
});

test("isFinalBonus", () => {
  const isFinalBonus = tester["isFinalBonus"];
  const basedOnFieldsMakingFinalBonus: EntityBonusBasedOn[] = ["hp", "atk", "def", "em", "er_", "healB_"];

  expect(isFinalBonus()).toBe(false);
  expect(isFinalBonus("base_atk")).toBe(false);

  for (const field of basedOnFieldsMakingFinalBonus) {
    expect(isFinalBonus(field)).toBe(true);
  }
});

test("isTrulyFinalBonus", () => {
  const isTrulyFinalBonus = tester["isTrulyFinalBonus"];
  const basedOnFieldsMakingFinalBonus: EntityBonusBasedOn[] = ["hp", "atk", "def", "em", "er_", "healB_"];

  const config: EntityBonusCore = {
    id: "",
    value: 2,
  };
  expect(isTrulyFinalBonus(config)).toBe(false);

  config.basedOn = "base_atk";
  expect(isTrulyFinalBonus(config)).toBe(false);

  for (const field of basedOnFieldsMakingFinalBonus) {
    config.basedOn = field;
    expect(isTrulyFinalBonus(config)).toBe(true);
  }

  // Reset basedOn
  config.basedOn = undefined;
  expect(isTrulyFinalBonus(config)).toBe(false);

  config.preExtra = {
    id: "",
    value: 3,
    basedOn: "base_atk",
  };
  expect(isTrulyFinalBonus(config)).toBe(false);

  for (const field of basedOnFieldsMakingFinalBonus) {
    config.preExtra = {
      id: "",
      value: 3,
      basedOn: field,
    };
    expect(isTrulyFinalBonus(config)).toBe(true);
  }
});
