import { TotalAttributeControl } from "@/calculation/InputProcessor/TotalAttributeControl";
import { BareBonus, EntityBonusEffect } from "@/calculation/types";
import { __genMutableTeamDataTester } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "./test-utils";

class Tester extends BareBonusGetterTester {
  bonus: BareBonus = {
    id: "",
    isStable: true,
    value: 0,
  };
  extra: EntityBonusEffect = {
    id: "",
    value: 0,
  };

  __apply(extra: number | EntityBonusEffect) {
    this.applyExtra(this.bonus, extra, { inputs: this.inputs, fromSelf: this.fromSelf });
  }

  __expect(value: number, isStable?: boolean) {
    expect(this.bonus.value).toBe(value);

    if (isStable !== undefined) {
      expect(this.bonus.isStable).toBe(isStable);
    }
  }

  __applyThenExpect(value: number, isStable?: boolean) {
    this.__apply(this.extra);

    expect(this.bonus.value).toBe(value);

    if (isStable !== undefined) {
      expect(this.bonus.isStable).toBe(isStable);
    }
  }
}

describe("applyExtra", () => {
  let totalAttrCtrl: TotalAttributeControl;
  let tester: Tester;

  beforeEach(() => {
    totalAttrCtrl = new TotalAttributeControl();
    tester = new Tester(__genMutableTeamDataTester(), totalAttrCtrl);
  });

  test("extra is config as number", () => {
    tester.bonus.value = 100;
    tester.bonus.isStable = true;

    tester.__apply(10);
    tester.__expect(100 + 10, true);
  });

  test("extra can be check if applicable", () => {
    tester.bonus.value = 100;
    tester.extra = {
      id: "",
      value: 20,
      grantedAt: "C1",
    };
    tester.__applyThenExpect(100);

    tester.__updateActiveMember({ cons: 1 });
    tester.__applyThenExpect(120);
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

    tester.__applyThenExpect(100 + 2 * totalAttrCtrl.getTotal("atk"), false);
  });
});

/**
 * extra is config as EntityBonusEffect so it returned should be calculated by getBareBonus
 */
