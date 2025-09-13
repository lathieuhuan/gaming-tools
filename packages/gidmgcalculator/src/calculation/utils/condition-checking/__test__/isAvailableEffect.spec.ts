import { LEVELS } from "@/calculation/constants";
import { EffectGrantedAtConfig, CharacterMilestone } from "@/calculation/types";
import { __findAscensionByLevel, __genMutableTeamDataTester, MutableTeamDataTester } from "@UnitTest/test-utils";
import { isAvailableEffect } from "../isAvailableEffect";

describe("isAvailableEffect", () => {
  let tester: MutableTeamDataTester;
  let condition: EffectGrantedAtConfig;
  let inputs: number[] = [];
  let fromSelf = true;

  const __expectValue = (value: boolean) => {
    expect(isAvailableEffect(condition, tester.activeMember, inputs, fromSelf)).toBe(value);
  };

  beforeEach(() => {
    tester = __genMutableTeamDataTester();
    condition = {
      value: "A1",
    };
    inputs = [];
    fromSelf = true;
  });

  test("grantedAt/fromSelf: ascension milestones", () => {
    const ascensionMilestones: CharacterMilestone[] = ["A1", "A4"];

    for (const milestone of ascensionMilestones) {
      const requiredAscension = +milestone.slice(-1);
      condition.value = milestone;

      for (const level of LEVELS) {
        tester.activeMember.level = level;
        const ascension = __findAscensionByLevel(level);
        const expectedValue = ascension >= requiredAscension;

        __expectValue(expectedValue);
      }
    }
  });

  test("grantedAt/fromSelf: constellation milestones", () => {
    // tester.activeMember.cons = 0;
    // condition.grantedAt = "C1";
    // __expectValue(false);

    const constellationMilestones: CharacterMilestone[] = ["C1", "C2", "C4", "C6"];

    for (const milestone of constellationMilestones) {
      const requiredConstellation = +milestone.slice(-1);
      condition.value = milestone;

      for (const constellation of Array.from({ length: 7 }, (_, i) => i)) {
        tester.activeMember.cons = constellation;
        const expectedValue = constellation >= requiredConstellation;

        __expectValue(expectedValue);
      }
    }
  });

  test("grantedAt not fromSelf", () => {
    fromSelf = false;
    condition.altIndex = 0;

    inputs = [1];
    __expectValue(true);

    inputs = [0];
    __expectValue(false);

    condition.altIndex = 1;

    inputs = [-1, 1];
    __expectValue(true);

    inputs = [-2, 0];
    __expectValue(false);
  });
});
