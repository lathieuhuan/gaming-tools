import { LEVELS } from "@Src/backend/constants";
import { CharacterMilestone } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { characters, EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { ASCENSION_RANKS } from "@UnitTest/test-constants";
import { IsApplicableEffectTester } from "./test-utils";

let tester: IsApplicableEffectTester;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  tester = new IsApplicableEffectTester();
});

describe("condition: checkInput", () => {
  test("DEFAULT: only config value, inpIndex default to 0, comparison default to EQUAL", () => {
    tester.checkInput = 2;

    tester._expectInputs([tester.checkInputValue]).toBe(true);
    tester._expectInputs([tester.checkInputValue + 1]).toBe(false);

    tester.checkInput = {
      value: 3,
    };
    tester._expectInputs([tester.checkInputValue]).toBe(true);
    tester._expectInputs([tester.checkInputValue + 1]).toBe(false);
  });

  test("checkInput config with value and inpIndex", () => {
    tester.checkInput = {
      value: 2,
      inpIndex: 1,
    };
    tester._expectInputs([-1, tester.checkInputValue]).toBe(true);
    tester._expectInputs([tester.checkInputValue, 6]).toBe(false);
    tester._expectInputs([3, tester.checkInputValue + 1]).toBe(false);
  });

  test("checkInput config with value and comparison MIN", () => {
    tester.checkInput = {
      value: 2,
      comparison: "MIN",
    };
    tester._expectInputs([tester.checkInputValue]).toBe(true);
    tester._expectInputs([tester.checkInputValue + 1]).toBe(true);
    tester._expectInputs([tester.checkInputValue - 1]).toBe(false);
  });

  test("checkInput config with value and comparison MAX", () => {
    tester.checkInput = {
      value: 2,
      comparison: "MAX",
    };
    tester._expectInputs([tester.checkInputValue]).toBe(true);
    tester._expectInputs([tester.checkInputValue + 1]).toBe(false);
    tester._expectInputs([tester.checkInputValue - 1]).toBe(true);
  });

  test("checkInput config with value, inpIndex, and comparison MIN", () => {
    tester.checkInput = {
      value: 2,
      inpIndex: 1,
      comparison: "MIN",
    };
    tester._expectInputs([-2, tester.checkInputValue]).toBe(true);
    tester._expectInputs([-4, tester.checkInputValue + 1]).toBe(true);
    tester._expectInputs([-6, tester.checkInputValue - 1]).toBe(false);
    tester._expectInputs([tester.checkInputValue]).toBe(false);
  });
});

describe("condition: checkParty", () => {
  test("check DISTINCT_ELMT, comparison default to EQUAL", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
    };

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(false);

    tester._setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.BASIC, [
      $AppCharacter.get(EMockCharacter.CATALYST),
      $AppCharacter.get(EMockCharacter.TARTAGLIA),
    ]);
    tester._expectValue(false);
  });

  test("check DISTINCT_ELMT, comparison MIN", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
      comparison: "MIN",
    };

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(false);

    tester._setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.BASIC, [
      $AppCharacter.get(EMockCharacter.CATALYST),
      $AppCharacter.get(EMockCharacter.TARTAGLIA),
    ]);
    tester._expectValue(true);
  });

  test("check DISTINCT_ELMT, comparison MAX", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
      comparison: "MAX",
    };

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.CATALYST)]);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.BASIC, [
      $AppCharacter.get(EMockCharacter.CATALYST),
      $AppCharacter.get(EMockCharacter.TARTAGLIA),
    ]);
    tester._expectValue(false);
  });

  // check 'MIXED' manually
});

describe("condition: forElmts", () => {
  test("app character's element type included in forElmts", () => {
    tester.forElmts = ["pyro"];

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.CATALYST);
    tester._expectValue(false);

    tester.forElmts = ["pyro", "electro"];

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.CATALYST);
    tester._expectValue(true);
  });
});

describe("condition: forWeapons", () => {
  test("app character weapon type included in forWeapons", () => {
    tester.forWeapons = ["sword"];

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.CATALYST);
    tester._expectValue(false);

    tester.forWeapons = ["sword", "catalyst"];

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.CATALYST);
    tester._expectValue(true);
  });
});

describe("condition: partyOnlyElmts", () => {
  test("all elements of character & teammates must be included in partyOnlyElmts", () => {
    const electroCharacter = $AppCharacter.get(EMockCharacter.CATALYST);

    tester.partyOnlyElmts = ["pyro"];

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.BASIC, [electroCharacter]);
    tester._expectValue(false);

    tester.partyOnlyElmts = ["pyro", "electro"];

    tester._setInfo(EMockCharacter.BASIC, [electroCharacter]);
    tester._expectValue(true);
  });
});

describe("condition: partyElmtCount", () => {
  test("the number of characters whose elements are listed must be atleast the listed value", () => {
    const electroCharacter = $AppCharacter.get(EMockCharacter.CATALYST);

    tester.partyElmtCount = {
      pyro: 1,
    };

    tester._setInfo(EMockCharacter.CATALYST);
    tester._expectValue(false);

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.BASIC, [$AppCharacter.get(EMockCharacter.BASIC)]);
    tester._expectValue(true);

    tester.partyElmtCount = {
      pyro: 1,
      electro: 2,
    };

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(false);

    tester._setInfo(EMockCharacter.BASIC, [electroCharacter]);
    tester._expectValue(false);

    tester._setInfo(EMockCharacter.BASIC, [electroCharacter, electroCharacter]);
    tester._expectValue(true);
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

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.BASIC, [electroCharacter]);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.BASIC, [pyroCharacter]);
    tester._expectValue(false);

    tester.totalPartyElmtCount = {
      elements: ["pyro", "electro"],
      comparison: "MAX",
      value: 2,
    };

    tester._setInfo(EMockCharacter.BASIC);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.BASIC, [electroCharacter]);
    tester._expectValue(true);

    tester._setInfo(EMockCharacter.BASIC, [electroCharacter, electroCharacter]);
    tester._expectValue(false);

    tester._setInfo(EMockCharacter.BASIC, [electroCharacter, pyroCharacter]);
    tester._expectValue(false);

    tester._setInfo(EMockCharacter.BASIC, [electroCharacter, $AppCharacter.get(EMockCharacter.TARTAGLIA)]);
    tester._expectValue(true);
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
        const _expectValue = ascension >= requiredAscension;

        tester._expectValue(_expectValue);
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
        const _expectValue = constellation >= requiredConstellation;

        tester._expectValue(_expectValue);
      }
    }
  });

  test("grantedAt not fromSelf", () => {
    tester.fromSelf = false;
    tester.altIndex = 0;

    tester.inputs = [1];
    tester._expectValue(true);

    tester.inputs = [0];
    tester._expectValue(false);

    tester.altIndex = 1;

    tester.inputs = [-1, 1];
    tester._expectValue(true);

    tester.inputs = [-2, 0];
    tester._expectValue(false);
  });
});
