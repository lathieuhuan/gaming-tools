import { __genCalculationInfo, CharacterRecordTester } from "@UnitTest/test-utils";
import { ResistanceReductionControl } from "../resistance-reduction-control";
import { AttackElement, EntityDebuff, ResistanceReductionKey } from "@Src/backend/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { ATTACK_ELEMENTS, ELEMENT_TYPES } from "@Src/backend/constants";
import { CalcAppParty, Target } from "@Src/types";
import { $AppCharacter } from "@Src/services";

class Tester extends ResistanceReductionControl<CharacterRecordTester> {
  inputs: number[] = [];
  fromSelf = true;
  description = "";
  debuff: EntityDebuff = {
    index: 1,
  };
  target: Target = {
    code: 1,
    level: 100,
    resistances: {
      anemo: 10,
      cryo: 10,
      dendro: 10,
      electro: 10,
      geo: 10,
      hydro: 10,
      phys: 10,
      pyro: 10,
    },
  };

  __changeCharacter(name: __EMockCharacter) {
    this["characterRecord"].__updateCharacter(name);
  }

  __changeTeammates(appParty: CalcAppParty) {
    this["characterRecord"].__updateParty(appParty);
  }

  __resetReduct() {
    this["reductCounter"].reset();
  }

  __applyDebuff() {
    this.applyDebuff(this.debuff, this.inputs, this.fromSelf, this.description);
  }

  __expectReduct(key: ResistanceReductionKey, value: number) {
    expect(this["reductCounter"].get(key)).toBe(value);
  }

  __expectReducts(keys: ResistanceReductionKey[], value: number) {
    const remainKeys = new Set<ResistanceReductionKey>([...ATTACK_ELEMENTS, "def"]);

    for (const key of keys) {
      this.__expectReduct(key, value);
      remainKeys.delete(key);
    }

    remainKeys.forEach((key) => {
      this.__expectReduct(key, 0);
    });
  }

  private getFinalResistance(resistance: number, reduct: number) {
    const RES = (resistance - reduct) / 100;
    return RES < 0 ? 1 - RES / 2 : RES >= 0.75 ? 1 / (4 * RES + 1) : 1 - RES;
  }

  __expectResistance(key: AttackElement, reduct: number) {
    const resistance = this.target.resistances[key];
    expect(tester.applyTo(this.target)[key]).toBe(this.getFinalResistance(resistance, reduct));
  }
}

let tester: Tester;

beforeEach(() => {
  tester = new Tester(__genCalculationInfo());
});

test("add", () => {
  tester.add("def", 10, "");
  tester.__expectReduct("def", 10);
});

describe("applyDebuff", () => {
  test("target is ResistanceReductionKey", () => {
    tester.debuff.effects = {
      value: 20,
      targets: "pyro",
    };
    tester.__applyDebuff();
    tester.__expectReduct("pyro", 20);
  });

  test("target is INP_ELMT, inpIndex default to 0", () => {
    const elmtIndex = 2;

    tester.debuff.effects = {
      value: 15,
      targets: {
        type: "INP_ELMT",
      },
    };
    tester.inputs = [elmtIndex];

    tester.__applyDebuff();
    tester.__expectReduct(ELEMENT_TYPES[elmtIndex], 15);
  });

  test("target is INP_ELMT, inpIndex 1", () => {
    const elmtIndex = 3;

    tester.debuff.effects = {
      value: 18,
      targets: {
        type: "INP_ELMT",
        inpIndex: 1,
      },
    };
    tester.inputs = [-5, elmtIndex];

    tester.__applyDebuff();
    tester.__expectReduct(ELEMENT_TYPES[elmtIndex], 18);
  });

  test("target is XILONEN, party has 2 PHEC at most", () => {
    tester.debuff.effects = {
      value: 18,
      targets: {
        type: "XILONEN",
      },
    };
    tester.__changeCharacter(__EMockCharacter.BASIC); // pyro

    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "geo"], 18);

    //
    tester.__resetReduct();

    tester.__changeTeammates([$AppCharacter.get(__EMockCharacter.BASIC)]);
    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "geo"], 18);

    //
    tester.__resetReduct();

    tester.__changeTeammates([$AppCharacter.get(__EMockCharacter.CATALYST)]);
    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "electro", "geo"], 18);

    //
    tester.__resetReduct();

    tester.__changeTeammates([$AppCharacter.get(__EMockCharacter.ANEMO)]);
    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "geo"], 18);
  });

  test("target is XILONEN, party has more than 2 PHEC", () => {
    tester.debuff.effects = {
      value: 22,
      targets: {
        type: "XILONEN",
      },
    };
    tester.__changeCharacter(__EMockCharacter.BASIC);

    tester.__changeTeammates([
      $AppCharacter.get(__EMockCharacter.CATALYST),
      $AppCharacter.get(__EMockCharacter.TARTAGLIA),
    ]);
    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "electro", "hydro"], 22);

    //
    tester.__resetReduct();

    tester.__changeTeammates([
      $AppCharacter.get(__EMockCharacter.CATALYST),
      $AppCharacter.get(__EMockCharacter.TARTAGLIA),
      $AppCharacter.get(__EMockCharacter.ES_CALC_CONFIG),
    ]);
    tester.__applyDebuff();
    tester.__expectReducts(["pyro", "electro", "hydro", "cryo"], 22);
  });
});

test("applyTo", () => {
  tester.target.resistances.anemo = 5;
  tester.add("anemo", 10, "");
  tester.__expectResistance("anemo", 10);

  tester.target.resistances.pyro = 10;
  tester.add("pyro", 30, "");
  tester.__expectResistance("pyro", 30);

  tester.add("anemo", 30, "");
  tester.__expectResistance("anemo", 10 + 30);
});
