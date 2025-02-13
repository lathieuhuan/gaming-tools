import { TotalAttributeControl } from "@Src/backend/input-processor/stat-controls";
import { BareBonus, EntityBonusCore } from "@Src/backend/types";
import { __genCharacterDataTester } from "@UnitTest/test-utils";
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

  _apply(extra: number | EntityBonusCore) {
    this.applyExtra(this.bonus, extra, { inputs: this.inputs, fromSelf: this.fromSelf });
  }

  _expect(value: number, isStable?: boolean) {
    expect(this.bonus.value).toBe(value);

    if (isStable !== undefined) {
      expect(this.bonus.isStable).toBe(isStable);
    }
  }

  _applyThenExpect(value: number, isStable?: boolean) {
    this._apply(this.extra);

    expect(this.bonus.value).toBe(value);

    if (isStable !== undefined) {
      expect(this.bonus.isStable).toBe(isStable);
    }
  }
}

let totalAttrCtrl: TotalAttributeControl;
let tester: Tester;

beforeEach(() => {
  totalAttrCtrl = new TotalAttributeControl();
  tester = new Tester(__genCharacterDataTester(), totalAttrCtrl);
});

test("extra is config as number", () => {
  tester.bonus.value = 100;
  tester.bonus.isStable = true;

  tester._apply(10);
  tester._expect(100 + 10, true);
});

test("extra can be check if applicable", () => {
  tester.bonus.value = 100;
  tester.extra = {
    id: "",
    value: 20,
    grantedAt: "C1",
  };
  tester._applyThenExpect(100);

  tester.__updateCharacter("cons", 1);
  tester._applyThenExpect(120);
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

  tester._applyThenExpect(100 + 2 * totalAttrCtrl.getTotal("atk"), false);
});

/**
 * extra is config as EntityBonusCore so it returned should be calculated by getBareBonus
 */
