import { ELEMENT_TYPES } from "@Src/calculation/constants";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genMutableTeamDataTester } from "@UnitTest/test-utils";
import { ResistanceReductionControlTester } from "./test-utils";

let tester: ResistanceReductionControlTester;

beforeEach(() => {
  tester = new ResistanceReductionControlTester(__genMutableTeamDataTester());
});

describe("getPenaltyValue", () => {
  test("config with only value", () => {
    tester.__penaltyCore.value = 10;
    tester.__expectPenaltyValue(10);
  });

  test("penalty scale with level", () => {
    tester["teamData"].activeMember.ES = 10;
    tester.__penaltyCore = {
      value: 2,
      lvScale: {
        value: 0,
        talent: "ES",
      },
    };
    tester.__expectPenaltyValue(2 * 10);
  });

  test("penalty has preExtra", () => {
    tester.__penaltyCore = {
      value: 2,
      preExtra: 3,
    };
    tester.__expectPenaltyValue(2 + 3);

    tester.__penaltyCore = {
      value: 2,
      preExtra: {
        value: 4,
        grantedAt: "C1",
      },
    };
    tester.__expectPenaltyValue(2);

    tester["teamData"].activeMember.cons = 1;
    tester.__expectPenaltyValue(2 + 4);
  });

  test("penalty has max", () => {
    tester.__penaltyCore = {
      value: 2,
      preExtra: {
        value: 4,
        grantedAt: "C1",
      },
      max: 5,
    };
    tester.__expectPenaltyValue(2);

    tester["teamData"].activeMember.cons = 1;
    tester.__expectPenaltyValue(5);
  });
});

test("add", () => {
  tester.add("def", 10, "");
  tester.__expectReduct("def", 10);
});

describe("applyDebuff", () => {
  test("__target is ResistReductionKey", () => {
    tester.__debuff.effects = {
      value: 20,
      targets: "pyro",
    };
    tester.__applyDebuff();
    tester.__expectReduct("pyro", 20);
  });

  test("__target is INP_ELMT, inpIndex default to 0", () => {
    const elmtIndex = 2;

    tester.__debuff.effects = {
      value: 15,
      targets: {
        type: "INP_ELMT",
      },
    };
    tester.__inputs = [elmtIndex];

    tester.__applyDebuff();
    tester.__expectReduct(ELEMENT_TYPES[elmtIndex], 15);
  });

  test("__target is INP_ELMT, inpIndex 1", () => {
    const elmtIndex = 3;

    tester.__debuff.effects = {
      value: 18,
      targets: {
        type: "INP_ELMT",
        inpIndex: 1,
      },
    };
    tester.__inputs = [-5, elmtIndex];

    tester.__applyDebuff();
    tester.__expectReduct(ELEMENT_TYPES[elmtIndex], 18);
  });

  test("__target is XILONEN, team has 2 PHEC at most", () => {
    tester.__debuff.effects = {
      value: 18,
      targets: {
        type: "XILONEN",
      },
    };
    tester.__changeActiveMember(__EMockCharacter.BASIC); // pyro

    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "geo"], 18);

    //
    tester.__resetReduct();

    tester.__changeTeammates([__EMockCharacter.BASIC]);
    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "geo"], 18);

    //
    tester.__resetReduct();

    tester.__changeTeammates([__EMockCharacter.CATALYST]);
    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "electro", "geo"], 18);

    // //
    tester.__resetReduct();

    tester.__changeTeammates([__EMockCharacter.ANEMO]);
    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "geo"], 18);
  });

  test("__target is XILONEN, team has more than 2 PHEC", () => {
    tester.__debuff.effects = {
      value: 22,
      targets: {
        type: "XILONEN",
      },
    };
    tester.__changeActiveMember(__EMockCharacter.BASIC);

    tester.__changeTeammates([__EMockCharacter.CATALYST, __EMockCharacter.TARTAGLIA]);
    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "electro", "hydro"], 22);

    //
    tester.__resetReduct();

    tester.__changeTeammates([__EMockCharacter.CATALYST, __EMockCharacter.TARTAGLIA, __EMockCharacter.ES_CALC_CONFIG]);
    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "electro", "hydro", "cryo"], 22);
  });
});

test("applyTo", () => {
  tester.__target.resistances.anemo = 5;
  tester.add("anemo", 10, "");
  tester.__expectResistance("anemo", 10);

  tester.__target.resistances.pyro = 10;
  tester.add("pyro", 30, "");
  tester.__expectResistance("pyro", 30);

  tester.add("anemo", 30, "");
  tester.__expectResistance("anemo", 10 + 30);
});
