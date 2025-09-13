import { __genMutableTeamDataTester } from "@UnitTest/test-utils";
import { BareBonusGetter } from "../BareBonusGetter";

test("scaleRefi", () => {
  const tester = new BareBonusGetter(__genMutableTeamDataTester());
  const scaleRefi = tester["scaleRefi"];

  expect(scaleRefi(7, 2, 3)).toBe(7 + 2 * 3);
  expect(scaleRefi(6, 2)).toBe(6 + 2 * (6 / 3));
  expect(scaleRefi(6)).toBe(6);
  expect(scaleRefi(6, undefined, 100)).toBe(6);
});
