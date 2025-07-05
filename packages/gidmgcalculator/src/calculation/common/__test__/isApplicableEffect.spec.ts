import { LEVELS } from "@Src/calculation/constants";
import { CharacterMilestone } from "@Src/calculation/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __findAscensionByLevel } from "@UnitTest/test-utils";
import { IsApplicableEffectTester } from "./test-utils";

let tester: IsApplicableEffectTester;

beforeEach(() => {
  tester = new IsApplicableEffectTester();
});

describe("condition: checkInput", () => {
  test("DEFAULT: only config value, inpIndex default to 0, comparison default to EQUAL", () => {
    tester.checkInput = 2;

    tester.__expectInputs([tester.checkInputValue]).toBe(true);
    tester.__expectInputs([tester.checkInputValue + 1]).toBe(false);

    tester.checkInput = {
      value: 3,
    };
    tester.__expectInputs([tester.checkInputValue]).toBe(true);
    tester.__expectInputs([tester.checkInputValue + 1]).toBe(false);
  });

  test("checkInput config with value and inpIndex", () => {
    tester.checkInput = {
      value: 2,
      inpIndex: 1,
    };
    tester.__expectInputs([-1, tester.checkInputValue]).toBe(true);
    tester.__expectInputs([tester.checkInputValue, 6]).toBe(false);
    tester.__expectInputs([3, tester.checkInputValue + 1]).toBe(false);
  });

  test("checkInput config with value and comparison MIN", () => {
    tester.checkInput = {
      value: 2,
      comparison: "MIN",
    };
    tester.__expectInputs([tester.checkInputValue]).toBe(true);
    tester.__expectInputs([tester.checkInputValue + 1]).toBe(true);
    tester.__expectInputs([tester.checkInputValue - 1]).toBe(false);
  });

  test("checkInput config with value and comparison MAX", () => {
    tester.checkInput = {
      value: 2,
      comparison: "MAX",
    };
    tester.__expectInputs([tester.checkInputValue]).toBe(true);
    tester.__expectInputs([tester.checkInputValue + 1]).toBe(false);
    tester.__expectInputs([tester.checkInputValue - 1]).toBe(true);
  });

  test("checkInput config with value, inpIndex, and comparison MIN", () => {
    tester.checkInput = {
      value: 2,
      inpIndex: 1,
      comparison: "MIN",
    };
    tester.__expectInputs([-2, tester.checkInputValue]).toBe(true);
    tester.__expectInputs([-4, tester.checkInputValue + 1]).toBe(true);
    tester.__expectInputs([-6, tester.checkInputValue - 1]).toBe(false);
    tester.__expectInputs([tester.checkInputValue]).toBe(false);
  });
});

describe("condition: checkParty", () => {
  test("check DISTINCT_ELMT, comparison default to EQUAL", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
    };

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(false);

    tester.__setInfo(__EMockCharacter.BASIC, [__EMockCharacter.CATALYST]);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.BASIC, [__EMockCharacter.CATALYST, __EMockCharacter.TARTAGLIA]);
    tester.__expectValue(false);
  });

  test("check DISTINCT_ELMT, comparison MIN", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
      comparison: "MIN",
    };

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(false);

    tester.__setInfo(__EMockCharacter.BASIC, [__EMockCharacter.CATALYST]);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.BASIC, [__EMockCharacter.CATALYST, __EMockCharacter.TARTAGLIA]);
    tester.__expectValue(true);
  });

  test("check DISTINCT_ELMT, comparison MAX", () => {
    tester.checkParty = {
      type: "DISTINCT_ELMT",
      value: 2,
      comparison: "MAX",
    };

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.BASIC, [__EMockCharacter.CATALYST]);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.BASIC, [__EMockCharacter.CATALYST, __EMockCharacter.TARTAGLIA]);
    tester.__expectValue(false);
  });

  // check 'MIXED' manually
});

describe("condition: forElmts", () => {
  test("app character's element type included in forElmts", () => {
    tester.forElmts = ["pyro"];

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.CATALYST);
    tester.__expectValue(false);

    tester.forElmts = ["pyro", "electro"];

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.CATALYST);
    tester.__expectValue(true);
  });
});

describe("condition: forWeapons", () => {
  test("app character weapon type included in forWeapons", () => {
    tester.forWeapons = ["sword"];

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.CATALYST);
    tester.__expectValue(false);

    tester.forWeapons = ["sword", "catalyst"];

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.CATALYST);
    tester.__expectValue(true);
  });
});

describe("condition: partyOnlyElmts", () => {
  test("all elements of character & teammates must be included in partyOnlyElmts", () => {
    const electroCharacter = __EMockCharacter.CATALYST;

    tester.partyOnlyElmts = ["pyro"];

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.BASIC, [electroCharacter]);
    tester.__expectValue(false);

    tester.partyOnlyElmts = ["pyro", "electro"];

    tester.__setInfo(__EMockCharacter.BASIC, [electroCharacter]);
    tester.__expectValue(true);
  });
});

describe("condition: partyElmtCount", () => {
  test("the number of characters whose elements are listed must be atleast the listed value", () => {
    const electroCharacter = __EMockCharacter.CATALYST;

    tester.partyElmtCount = {
      pyro: 1,
    };

    tester.__setInfo(__EMockCharacter.CATALYST);
    tester.__expectValue(false);

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.BASIC, [__EMockCharacter.BASIC]);
    tester.__expectValue(true);

    tester.partyElmtCount = {
      pyro: 1,
      electro: 2,
    };

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(false);

    tester.__setInfo(__EMockCharacter.BASIC, [electroCharacter]);
    tester.__expectValue(false);

    tester.__setInfo(__EMockCharacter.BASIC, [electroCharacter, electroCharacter]);
    tester.__expectValue(true);
  });
});

describe("condition: totalPartyElmtCount", () => {
  test("the total number of characters whose elements are included must pass the comparison", () => {
    const pyroCharacter = __EMockCharacter.BASIC;
    const electroCharacter = __EMockCharacter.CATALYST;

    tester.totalPartyElmtCount = {
      elements: ["pyro"],
      comparison: "MAX",
      value: 1,
    };

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.BASIC, [electroCharacter]);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.BASIC, [pyroCharacter]);
    tester.__expectValue(false);

    tester.totalPartyElmtCount = {
      elements: ["pyro", "electro"],
      comparison: "MAX",
      value: 2,
    };

    tester.__setInfo(__EMockCharacter.BASIC);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.BASIC, [electroCharacter]);
    tester.__expectValue(true);

    tester.__setInfo(__EMockCharacter.BASIC, [electroCharacter, electroCharacter]);
    tester.__expectValue(false);

    tester.__setInfo(__EMockCharacter.BASIC, [electroCharacter, pyroCharacter]);
    tester.__expectValue(false);

    tester.__setInfo(__EMockCharacter.BASIC, [electroCharacter, __EMockCharacter.TARTAGLIA]);
    tester.__expectValue(true);
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
        tester.characterData.character.level = level;
        const ascension = __findAscensionByLevel(level);
        const __expectValue = ascension >= requiredAscension;

        tester.__expectValue(__expectValue);
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
        tester.characterData.character.cons = constellation;
        const __expectValue = constellation >= requiredConstellation;

        tester.__expectValue(__expectValue);
      }
    }
  });

  test("grantedAt not fromSelf", () => {
    tester.fromSelf = false;
    tester.altIndex = 0;

    tester.inputs = [1];
    tester.__expectValue(true);

    tester.inputs = [0];
    tester.__expectValue(false);

    tester.altIndex = 1;

    tester.inputs = [-1, 1];
    tester.__expectValue(true);

    tester.inputs = [-2, 0];
    tester.__expectValue(false);
  });
});
