import { __genCalculationInfo } from "@UnitTest/test-utils";
import { ResistanceReductionControl } from "../resistance-reduction-control";
import { AttackElement, EntityDebuff, ResistanceReductionKey } from "@Src/backend/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { ATTACK_ELEMENTS, ELEMENT_TYPES } from "@Src/backend/constants";
import { PartyData, Target } from "@Src/types";
import { $AppCharacter } from "@Src/services";

class Tester extends ResistanceReductionControl {
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

  _changeCharacter(name: __EMockCharacter) {
    const info = __genCalculationInfo(name);
    this["info"].char = info.char;
    this["info"].appChar = info.appChar;
  }

  _changeTeammates(partyData: PartyData) {
    this["info"].partyData = partyData;
  }

  _resetReduct() {
    this["reductCounter"].reset();
  }

  _applyDebuff() {
    this.applyDebuff(this.debuff, this.inputs, this.fromSelf, this.description);
  }

  _expectReduct(key: ResistanceReductionKey, value: number) {
    expect(this["reductCounter"].get(key)).toBe(value);
  }

  _expectReducts(keys: ResistanceReductionKey[], value: number) {
    const remainKeys = new Set<ResistanceReductionKey>([...ATTACK_ELEMENTS, "def"]);

    for (const key of keys) {
      this._expectReduct(key, value);
      remainKeys.delete(key);
    }

    remainKeys.forEach((key) => {
      this._expectReduct(key, 0);
    });
  }

  private getFinalResistance(resistance: number, reduct: number) {
    const RES = (resistance - reduct) / 100;
    return RES < 0 ? 1 - RES / 2 : RES >= 0.75 ? 1 / (4 * RES + 1) : 1 - RES;
  }

  _expectResistance(key: AttackElement, reduct: number) {
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
  tester._expectReduct("def", 10);
});

describe("applyDebuff", () => {
  test("target is ResistanceReductionKey", () => {
    tester.debuff.effects = {
      value: 20,
      targets: "pyro",
    };
    tester._applyDebuff();
    tester._expectReduct("pyro", 20);
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

    tester._applyDebuff();
    tester._expectReduct(ELEMENT_TYPES[elmtIndex], 15);
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

    tester._applyDebuff();
    tester._expectReduct(ELEMENT_TYPES[elmtIndex], 18);
  });

  test("target is XILONEN, party has 2 PHEC at most", () => {
    tester.debuff.effects = {
      value: 18,
      targets: {
        type: "XILONEN",
      },
    };
    tester._changeCharacter(__EMockCharacter.BASIC); // pyro

    tester._applyDebuff();
    tester._expectReducts(["pyro", "geo"], 18);

    //
    tester._resetReduct();

    tester._changeTeammates([$AppCharacter.get(__EMockCharacter.BASIC)]);
    tester._applyDebuff();
    tester._expectReducts(["pyro", "geo"], 18);

    //
    tester._resetReduct();

    tester._changeTeammates([$AppCharacter.get(__EMockCharacter.CATALYST)]);
    tester._applyDebuff();
    tester._expectReducts(["pyro", "electro", "geo"], 18);

    //
    tester._resetReduct();

    tester._changeTeammates([$AppCharacter.get(__EMockCharacter.ANEMO)]);
    tester._applyDebuff();
    tester._expectReducts(["pyro", "geo"], 18);
  });

  test("target is XILONEN, party has more than 2 PHEC", () => {
    tester.debuff.effects = {
      value: 22,
      targets: {
        type: "XILONEN",
      },
    };
    tester._changeCharacter(__EMockCharacter.BASIC);

    tester._changeTeammates([
      $AppCharacter.get(__EMockCharacter.CATALYST),
      $AppCharacter.get(__EMockCharacter.TARTAGLIA),
    ]);
    tester._applyDebuff();
    tester._expectReducts(["pyro", "electro", "hydro"], 22);

    //
    tester._resetReduct();

    tester._changeTeammates([
      $AppCharacter.get(__EMockCharacter.CATALYST),
      $AppCharacter.get(__EMockCharacter.TARTAGLIA),
      $AppCharacter.get(__EMockCharacter.ES_CALC_CONFIG),
    ]);
    tester._applyDebuff();
    tester._expectReducts(["pyro", "electro", "hydro", "cryo"], 22);
  });
});

test("applyTo", () => {
  tester.target.resistances.anemo = 5;
  tester.add("anemo", 10, "");
  tester._expectResistance("anemo", 10);

  tester.target.resistances.pyro = 10;
  tester.add("pyro", 30, "");
  tester._expectResistance("pyro", 30);

  tester.add("anemo", 30, "");
  tester._expectResistance("anemo", 10 + 30);
});
