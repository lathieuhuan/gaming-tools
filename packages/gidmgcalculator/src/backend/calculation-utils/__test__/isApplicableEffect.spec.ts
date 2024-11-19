import { $AppCharacter } from "@Src/services";
import { characters, EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { IsApplicableEffectTester } from "./test-utils";
import { CharacterMilestone } from "@Src/backend/types";
import { LEVELS } from "@Src/backend/constants";
import { ASCENSION_RANKS } from "@UnitTest/test-constants";

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

    tester.expectInputs([tester.checkInputValue]).toBe(true);
    tester.expectInputs([tester.checkInputValue + 1]).toBe(false);
  });

  test("checkInput config as object with only value", () => {
    tester.checkInput = {
      value: 2,
    };
    tester.expectInputs([tester.checkInputValue]).toBe(true);
    tester.expectInputs([tester.checkInputValue + 1]).toBe(false);
  });

  test("checkInput config as object with value and inpIndex", () => {
    tester.checkInput = {
      value: 2,
      inpIndex: 1,
    };
    tester.expectInputs([-1, tester.checkInputValue]).toBe(true);
    tester.expectInputs([tester.checkInputValue, 6]).toBe(false);
    tester.expectInputs([3, tester.checkInputValue + 1]).toBe(false);
  });

  test("checkInput config as object with value and compare MIN", () => {
    tester.checkInput = {
      value: 2,
      comparison: "MIN",
    };
    tester.expectInputs([tester.checkInputValue]).toBe(true);
    tester.expectInputs([tester.checkInputValue + 1]).toBe(true);
    tester.expectInputs([tester.checkInputValue - 1]).toBe(false);
  });

  test("checkInput config as object with value and compare MAX", () => {
    tester.checkInput = {
      value: 2,
      comparison: "MAX",
    };
    tester.expectInputs([tester.checkInputValue]).toBe(true);
    tester.expectInputs([tester.checkInputValue + 1]).toBe(false);
    tester.expectInputs([tester.checkInputValue - 1]).toBe(true);
  });

  test("checkInput config as object with value, inpIndex, and compare MIN", () => {
    tester.checkInput = {
      value: 2,
      inpIndex: 1,
      comparison: "MIN",
    };
    tester.expectInputs([-2, tester.checkInputValue]).toBe(true);
    tester.expectInputs([-4, tester.checkInputValue + 1]).toBe(true);
    tester.expectInputs([-6, tester.checkInputValue - 1]).toBe(false);
    tester.expectInputs([tester.checkInputValue]).toBe(false);
  });
});

describe("condition: checkParty", () => {
  test("check 'DISTINCT_ELMT', compare EQUAL", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
    };

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(false);

    tester.setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.BASIC, [
      $AppCharacter.get(EMockCharacter.CATALYST),
      $AppCharacter.get(EMockCharacter.TARTAGLIA),
    ]);
    tester.expectValue(false);
  });

  test("check 'DISTINCT_ELMT', compare MIN", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
      comparison: "MIN",
    };

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(false);

    tester.setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.BASIC, [
      $AppCharacter.get(EMockCharacter.CATALYST),
      $AppCharacter.get(EMockCharacter.TARTAGLIA),
    ]);
    tester.expectValue(true);
  });

  test("check 'DISTINCT_ELMT', compare MAX", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
      comparison: "MAX",
    };

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.BASIC, [
      $AppCharacter.get(EMockCharacter.CATALYST),
      $AppCharacter.get(EMockCharacter.TARTAGLIA),
    ]);
    tester.expectValue(false);
  });

  // check 'MIXED' manually
});

describe("condition: forElmts", () => {
  test("app character's element type included in forElmts", () => {
    tester.forElmts = ["pyro"];

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.CATALYST);
    tester.expectValue(false);

    tester.forElmts = ["pyro", "electro"];

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.CATALYST);
    tester.expectValue(true);
  });
});

describe("condition: forWeapons", () => {
  test("app character weapon type included in forWeapons", () => {
    tester.forWeapons = ["sword"];

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.CATALYST);
    tester.expectValue(false);

    tester.forWeapons = ["sword", "catalyst"];

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.CATALYST);
    tester.expectValue(true);
  });
});

describe("condition: partyOnlyElmts", () => {
  test("all elements of character & teammates must be included in partyOnlyElmts", () => {
    tester.partyOnlyElmts = ["pyro"];

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester.expectValue(false);

    tester.partyOnlyElmts = ["pyro", "electro"];

    tester.setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester.expectValue(true);
  });
});

describe("condition: partyElmtCount", () => {
  test("the number of characters whose elements are listed must be atleast the listed value", () => {
    const electroCharacter = $AppCharacter.get(EMockCharacter.CATALYST);

    tester.partyElmtCount = {
      pyro: 1,
    };

    tester.setInfo(EMockCharacter.CATALYST);
    tester.expectValue(false);

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.BASIC)]);
    tester.expectValue(true);

    tester.partyElmtCount = {
      pyro: 1,
      electro: 2,
    };

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(false);

    tester.setInfo(EMockCharacter.BASIC, [electroCharacter]);
    tester.expectValue(false);

    tester.setInfo(EMockCharacter.BASIC, [electroCharacter, electroCharacter]);
    tester.expectValue(true);
  });
});

describe("condition: totalPartyElmtCount", () => {
  test("the total number of characters whose elements are included must pass the comparison", () => {
    const pyroCharacter = $AppCharacter.get(EMockCharacter.BASIC);
    const electroCharacter = $AppCharacter.get(EMockCharacter.CATALYST);

    tester.totalPartyElmtCount = {
      elements: ["pyro"],
      comparison: "MAX",
      value: 1,
    };

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.BASIC, [electroCharacter]);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.BASIC, [pyroCharacter]);
    tester.expectValue(false);

    tester.totalPartyElmtCount = {
      elements: ["pyro", "electro"],
      comparison: "MAX",
      value: 2,
    };

    tester.setInfo(EMockCharacter.BASIC);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.BASIC, [electroCharacter]);
    tester.expectValue(true);

    tester.setInfo(EMockCharacter.BASIC, [electroCharacter, electroCharacter]);
    tester.expectValue(false);

    tester.setInfo(EMockCharacter.BASIC, [electroCharacter, pyroCharacter]);
    tester.expectValue(false);

    tester.setInfo(EMockCharacter.BASIC, [electroCharacter, $AppCharacter.get(EMockCharacter.TARTAGLIA)]);
    tester.expectValue(true);
  });
});

describe("condition: grantedAt", () => {
  test("ascension milestones, fromSelf", () => {
    tester.fromSelf = true;

    const ascensionMilestones: CharacterMilestone[] = ["A1", "A4"];

    for (const milestone of ascensionMilestones) {
      const requiredAscension = +milestone.slice(-1);
      tester.grantedAt = milestone;

      for (const level of LEVELS) {
        tester.info.char.level = level;
        const ascension = ASCENSION_RANKS.find((rank) => rank.levels.includes(level))!.value;
        const expectValue = ascension >= requiredAscension;

        tester.expectValue(expectValue);
      }
    }
  });

  test("constellation milestones, fromSelf", () => {
    tester.fromSelf = true;

    const constellationMilestones: CharacterMilestone[] = ["C1", "C2", "C4", "C6"];

    for (const milestone of constellationMilestones) {
      const requiredConstellation = +milestone.slice(-1);
      tester.grantedAt = milestone;

      for (const constellation of Array.from({ length: 7 }, (_, i) => i)) {
        tester.info.char.cons = constellation;
        const expectValue = constellation >= requiredConstellation;

        tester.expectValue(expectValue);
      }
    }
  });

  test("grantedAt not fromSelf", () => {
    tester.fromSelf = false;
    tester.altIndex = 0;

    tester.inputs = [1];
    tester.expectValue(true);

    tester.inputs = [0];
    tester.expectValue(false);

    tester.altIndex = 1;

    tester.inputs = [-1, 1];
    tester.expectValue(true);

    tester.inputs = [-2, 0];
    tester.expectValue(false);
  });
});
