import { __genMutableTeamDataTester } from "@UnitTest/test-utils";
import { AppliedBonusesGetter } from "../AppliedBonusesGetter";

describe("isStackable", () => {
  class Tester extends AppliedBonusesGetter {
    __isStackable = this.isStackable;
  }

  let tester: Tester;

  beforeEach(() => {
    tester = new Tester(__genMutableTeamDataTester());
  });

  test("path: string", () => {
    expect(
      tester.__isStackable({
        trackId: "tracked_1",
        targetId: "abc",
      })
    ).toBe(true);

    expect(
      tester.__isStackable({
        trackId: "tracked_2",
        targetId: "abc",
      })
    ).toBe(true);

    expect(
      tester.__isStackable({
        trackId: "tracked_1",
        targetId: "xyz",
      })
    ).toBe(true);

    expect(
      tester.__isStackable({
        trackId: "tracked_1",
        targetId: "abc",
      })
    ).toBe(false);
  });
});
