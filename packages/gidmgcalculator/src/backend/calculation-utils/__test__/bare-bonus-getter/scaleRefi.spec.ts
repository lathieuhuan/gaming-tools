import { $AppCharacter } from "@Src/services";
import { characters } from "@UnitTest/mocks/characters.mock";
import { genCalculationInfo } from "@UnitTest/test-utils";
import { BareBonusGetter } from "../../bare-bonus-getter";

beforeAll(() => {
  $AppCharacter.populate(characters);
});

test("scaleRefi", () => {
  const tester = new BareBonusGetter(genCalculationInfo());
  const scaleRefi = tester["scaleRefi"];

  expect(scaleRefi(7, 2, 3)).toBe(7 + 2 * 3);
  expect(scaleRefi(6, 2)).toBe(6 + 2 * (6 / 3));
  expect(scaleRefi(6)).toBe(6);
  expect(scaleRefi(6, undefined, 100)).toBe(6);
});
