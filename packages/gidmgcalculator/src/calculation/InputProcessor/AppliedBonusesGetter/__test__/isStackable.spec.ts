import { __genMutableTeamDataTester } from "@UnitTest/test-utils";
import { AppliedBonusesGetter } from "../AppliedBonusesGetter";

describe("isStackable", () => {
  class Tester extends AppliedBonusesGetter {
    __isStackable = this.isStackable;
  }

  let tester: Tester;

  beforeEach(() => {
    tester = new Tester(true, __genMutableTeamDataTester());
  });

  test("path: string", () => {
    expect(
      tester.__isStackable({
        trackId: "tracked_1",
        paths: "abc",
      })
    ).toBe(true);

    expect(
      tester.__isStackable({
        trackId: "tracked_2",
        paths: "abc",
      })
    ).toBe(true);

    expect(
      tester.__isStackable({
        trackId: "tracked_1",
        paths: "xyz",
      })
    ).toBe(true);

    expect(
      tester.__isStackable({
        trackId: "tracked_1",
        paths: "abc",
      })
    ).toBe(false);
  });

  test("path: string[]", () => {
    expect(
      tester.__isStackable({
        trackId: "tracked_1",
        paths: ["abc", "xyz"],
      })
    ).toBe(true);

    expect(
      tester.__isStackable({
        trackId: "tracked_2",
        paths: ["abc", "xyz"],
      })
    ).toBe(true);

    expect(
      tester.__isStackable({
        trackId: "tracked_1",
        paths: ["xyz", "abc"], // different order is accepted
      })
    ).toBe(true);

    expect(
      tester.__isStackable({
        trackId: "tracked_1",
        paths: ["abc", "xyz"],
      })
    ).toBe(false);
  });

  test("path: string | string[]", () => {
    expect(
      tester.__isStackable({
        trackId: "tracked_1",
        paths: "abc",
      })
    ).toBe(true);

    expect(
      tester.__isStackable({
        trackId: "tracked_1",
        paths: ["abc", "xyz"],
      })
    ).toBe(true);
  });
});
