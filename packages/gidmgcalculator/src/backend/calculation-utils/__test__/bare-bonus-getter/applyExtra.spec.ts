import { TotalAttributeControl } from "@Src/backend/controls";
import { BareBonus, EntityBonusCore } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { characters } from "@UnitTest/mocks/characters.mock";
import { genCalculationInfo } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "../test-utils";

class Tester extends BareBonusGetterTester {
  bonus: BareBonus = {
    id: "",
    isStable: true,
    value: 0,
  };
  extra: EntityBonusCore = {
    id: "",
    value: 0,
  };

  apply(extra: number | EntityBonusCore) {
    this.applyExtra(this.bonus, extra, { inputs: this.inputs, fromSelf: this.fromSelf });
  }

  expect(value: number, isStable?: boolean) {
    expect(this.bonus.value).toBe(value);

    if (isStable !== undefined) {
      expect(this.bonus.isStable).toBe(isStable);
    }
  }

  applyThenExpect(value: number, isStable?: boolean) {
    this.apply(this.extra);

    expect(this.bonus.value).toBe(value);

    if (isStable !== undefined) {
      expect(this.bonus.isStable).toBe(isStable);
    }
  }
}

let totalAttrCtrl: TotalAttributeControl;
let tester: Tester;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  totalAttrCtrl = new TotalAttributeControl();
  tester = new Tester(genCalculationInfo(), totalAttrCtrl);
});

test("extra is config as number", () => {
  tester.bonus.value = 100;
  tester.bonus.isStable = true;

  tester.apply(10);
  tester.expect(100 + 10, true);
});

test("extra can be check if applicable", () => {
  tester.bonus.value = 100;
  tester.extra = {
    id: "",
    value: 20,
    grantedAt: "C1",
  };
  tester.applyThenExpect(100);

  tester.updateCharacter("cons", 1);
  tester.applyThenExpect(120);
});

test("unstable extra makes bonus unstable", () => {
  totalAttrCtrl.applyBonuses({
    value: 1000,
    toStat: "atk",
    description: "",
  });

  tester.bonus.value = 100;
  tester.extra = {
    id: "",
    value: 2,
    basedOn: "atk",
  };

  tester.applyThenExpect(100 + 2 * totalAttrCtrl.getTotal("atk"), false);
});

/**
 * extra is config as EntityBonusCore so it returned should be calculated by getBareBonus
 */
