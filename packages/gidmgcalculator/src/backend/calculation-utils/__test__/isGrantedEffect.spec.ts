import { LEVELS } from "@Src/backend/constants";
import { CharacterMilestone } from "@Src/backend/types";
import { Character } from "@Src/types";
import { ASCENSION_RANKS } from "@UnitTest/test-constants";
import { isGrantedEffect } from "../isGrantedEffect";

const DEFAULT_CHARACTER: Character = {
  name: "Character",
  level: "1/20",
  cons: 0,
  NAs: 1,
  ES: 1,
  EB: 1,
};

test("ascension milestones", () => {
  const ascensionMilestones: CharacterMilestone[] = ["A1", "A4"];

  for (const level of LEVELS) {
    const character: Character = {
      ...DEFAULT_CHARACTER,
      level,
    };
    const ascension = ASCENSION_RANKS.find((rank) => rank.levels.includes(level))!.value;

    for (const milestone of ascensionMilestones) {
      const requiredAscension = +milestone.slice(-1);
      const expectValue = ascension >= requiredAscension;

      expect(isGrantedEffect({ grantedAt: milestone }, character)).toBe(expectValue);
    }
  }
});

test("constellation milestones", () => {
  const constellationMilestones: CharacterMilestone[] = ["C1", "C2", "C4", "C6"];

  for (const constellation of Array.from({ length: 7 }, (_, i) => i)) {
    const character: Character = {
      ...DEFAULT_CHARACTER,
      cons: constellation,
    };

    for (const milestone of constellationMilestones) {
      const requiredConstellation = +milestone.slice(-1);
      const expectValue = constellation >= requiredConstellation;

      expect(isGrantedEffect({ grantedAt: milestone }, character)).toBe(expectValue);
    }
  }
});
