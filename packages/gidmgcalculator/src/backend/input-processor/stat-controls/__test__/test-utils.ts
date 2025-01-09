import { ATTACK_ELEMENTS } from "@Src/backend/constants";
import { AttackElement, EntityDebuff, EntityPenaltyCore, ResistanceReductionKey } from "@Src/backend/types";
import { Target } from "@Src/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { CharacterDataTester } from "@UnitTest/test-utils";
import { ResistanceReductionControl } from "../resistance-reduction-control";

export class ResistanceReductionControlTester extends ResistanceReductionControl<CharacterDataTester> {
  __inputs: number[] = [];
  __fromSelf = true;
  __description = "";
  __debuff: EntityDebuff = {
    index: 1,
  };
  __target: Target = {
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
  __penaltyCore: EntityPenaltyCore = {
    value: 0,
  };
  //   characterData = __genCharacterDataTester();

  __changeCharacter(name: __EMockCharacter) {
    this["characterData"].__updateCharacter(name);
  }

  __changeTeammates(names: string[]) {
    this["characterData"].__updateParty(names);
  }

  __resetReduct() {
    this["reductCounter"].reset();
  }

  __applyDebuff() {
    this.applyDebuff(this.__debuff, this.__inputs, this.__fromSelf, this.__description);
  }

  __expectPenaltyValue(value: number) {
    expect(this.getPenaltyValue(this.__penaltyCore, this.__inputs, this.__fromSelf)).toBe(value);
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
    const resistance = this.__target.resistances[key];
    expect(this.applyTo(this.__target)[key]).toBe(this.getFinalResistance(resistance, reduct));
  }
}
