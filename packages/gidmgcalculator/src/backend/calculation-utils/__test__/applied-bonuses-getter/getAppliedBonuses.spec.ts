import { TotalAttributeControl } from "@Src/backend/controls";
import { AppliedAttributeBonus, AppliedBonuses, EntityBuff } from "@Src/backend/types";
import { Character } from "@Src/types";
import { __genCalculationInfo } from "@UnitTest/test-utils";
import { AppliedBonusesGetter } from "../../applied-bonuses-getter";

/**
 * The rest of getAppliedBonuses is tested in applyBonus.spec
 */

class Tester extends AppliedBonusesGetter {
  inputs: number[] = [1, 1, 1, 1];
  fromSelf = true;
  effects: EntityBuff["effects"];
  isFinal?: boolean;
  description = "";

  _updateCharacter<TKey extends keyof Character>(key: TKey, value: Character[TKey]) {
    this.info.char[key] = value;
  }

  _getAppliedBonuses(effects: EntityBuff["effects"]) {
    return this.getAppliedBonuses(
      {
        effects,
      },
      {
        fromSelf: this.fromSelf,
        inputs: this.inputs,
      },
      this.description,
      this.isFinal
    );
  }

  _expectResult(result: AppliedBonuses) {
    expect(this._getAppliedBonuses(this.effects)).toEqual(result);
  }
}

let totalAttrCtrl: TotalAttributeControl;
let tester: Tester;

beforeEach(() => {
  totalAttrCtrl = new TotalAttributeControl();
  tester = new Tester(__genCalculationInfo(), totalAttrCtrl);
});

test("effects is required on buff", () => {
  const effectValue = 10;

  tester._expectResult({
    attrBonuses: [],
    attkBonuses: [],
  });

  tester.effects = {
    id: "ID",
    value: effectValue,
    targets: { module: "ATTR", path: "atk_" },
  };
  tester._expectResult({
    attrBonuses: [
      {
        id: "ID",
        value: effectValue,
        toStat: "atk_",
        isStable: true,
        description: tester.description,
      },
    ],
    attkBonuses: [],
  });
});

// more tests of checking if effect is final can be found in isFinalBonus.spec
test("if isFinal is provided, it should meet isFinal on effect", () => {
  const attributeValue = 1000;
  const attributeType = "atk";

  tester.isFinal = undefined;

  const appliedBonuses_1 = tester._getAppliedBonuses({
    id: "1",
    value: attributeValue,
    targets: { module: "ATTR", path: attributeType },
  });

  const expectedBonus: AppliedAttributeBonus = {
    id: "1",
    value: attributeValue,
    toStat: attributeType,
    isStable: true,
    description: tester.description,
  };

  expect(appliedBonuses_1).toEqual({
    attrBonuses: [expectedBonus],
    attkBonuses: [],
  });

  totalAttrCtrl.applyBonuses(expectedBonus);

  // isFinal true, basedOn is required on effect to meet isFinal

  const effectValue = 1;
  tester.isFinal = true;

  tester.effects = {
    id: "2",
    value: effectValue,
    targets: { module: "ES", path: "pct_" },
  };
  tester._expectResult({
    attrBonuses: [],
    attkBonuses: [],
  });

  tester.effects.basedOn = attributeType;
  tester._expectResult({
    attrBonuses: [],
    attkBonuses: [
      {
        id: "2",
        value: effectValue * totalAttrCtrl.getTotal(attributeType),
        toType: "ES",
        toKey: "pct_",
        description: tester.description,
      },
    ],
  });
});

// more test of checking if effect is applicable can be found in isApplicableEffect.spec
test("effect must be applicable", () => {
  tester.effects = {
    id: "ID",
    grantedAt: "C6",
    value: 2000,
    targets: { module: "ATTR", path: "hp" },
  };

  tester._updateCharacter("cons", 1);
  tester._expectResult({
    attrBonuses: [],
    attkBonuses: [],
  });

  tester._updateCharacter("cons", 6);
  tester._expectResult({
    attrBonuses: [
      {
        id: "ID",
        value: 2000,
        toStat: "hp",
        isStable: true,
        description: tester.description,
      },
    ],
    attkBonuses: [],
  });
});
