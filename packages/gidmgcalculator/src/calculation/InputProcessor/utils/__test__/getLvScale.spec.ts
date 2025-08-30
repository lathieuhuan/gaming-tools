import { CharacterEffectLevelScale } from "@/calculation/types";
import { __genMutableTeamDataTester, MutableTeamDataTester } from "@UnitTest/test-utils";
import { getLevelScale } from "../getLevelScale";

describe("getLevelScale", () => {
  let teamData: MutableTeamDataTester;

  const __expectValue = (scale: CharacterEffectLevelScale, inputs: number[], fromSelf: boolean) => {
    return getLevelScale(scale, teamData, inputs, fromSelf);
  };

  beforeEach(() => {
    teamData = __genMutableTeamDataTester();
    teamData.__updateActiveMember({ ES: 10 });
  });

  test("at scale 0, fromSelf", () => {
    expect(__expectValue({ talent: "ES", value: 0 }, [], true)).toBe(10);
  });

  test("at scale 2, fromSelf", () => {
    expect(__expectValue({ talent: "ES", value: 2 }, [], true)).toBe(1.8); // TALENT_LV_MULTIPLIERS[2][activeMember.ES]
  });

  test("at scale 2, not fromSelf, altIndex default (0)", () => {
    expect(__expectValue({ talent: "ES", value: 2 }, [7], false)).toBe(1.5); // TALENT_LV_MULTIPLIERS[2][7]
  });

  test("at scale 2, not fromSelf, altIndex 1", () => {
    expect(__expectValue({ talent: "ES", value: 2, altIndex: 1 }, [0, 10], false)).toBe(1.8); // TALENT_LV_MULTIPLIERS[2][10]
  });
});
