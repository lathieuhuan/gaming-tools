import { TotalAttributeControl } from "@Src/backend/controls";
import { EntityBonusBasedOn, EntityBonusBasedOnField } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { characters } from "@UnitTest/mocks/characters.mock";
import { genCalculationInfo } from "@UnitTest/test-utils";
import { BareBonusGetterTester } from "../test-utils";

class Tester extends BareBonusGetterTester {
  readonly basedOnField = "atk";
  basedOnStable = true;

  /** Do not mutate field */
  config: Exclude<EntityBonusBasedOn, EntityBonusBasedOnField> = {
    field: this.basedOnField,
  };

  expectWithBasedOnField(value: number) {
    expect(
      this.getBasedOn(this.basedOnField, {
        inputs: this.inputs,
        fromSelf: this.fromSelf,
        basedOnStable: this.basedOnStable,
      })
    ).toEqual({
      field: "atk",
      value: value,
    });
  }

  expect(value: number) {
    expect(
      this.getBasedOn(
        {
          ...this.config,
          field: this.basedOnField,
        },
        {
          inputs: this.inputs,
          fromSelf: this.fromSelf,
          basedOnStable: this.basedOnStable,
        }
      )
    ).toEqual({
      field: "atk",
      value: value,
    });
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

describe("[based on inputs] or not fromSelf", () => {
  beforeEach(() => {
    tester.fromSelf = false;
  });

  test("altIndex default to 0, no baseline", () => {
    const input = 100;

    tester.inputs = [input];
    tester.expect(input);
    tester.expectWithBasedOnField(input);

    // when no input found, value should be 1, because basedOn value is a multiplier
    tester.inputs = [];
    tester.expect(1);
  });

  test("altIndex 1, no baseline", () => {
    const input = 100;
    tester.config.altIndex = 1;

    tester.inputs = [-3, input];
    tester.expect(input);
  });

  test("baseline 100", () => {
    const input = 150;
    const baseline = 100;
    tester.config.baseline = baseline;

    tester.inputs = [input];
    tester.expect(input - baseline);

    tester.inputs = [baseline - 50];
    tester.expect(0);

    tester.config.altIndex = 1;

    tester.inputs = [-2, input];
    tester.expect(input - baseline);

    tester.inputs = [-1, baseline - 50];
    tester.expect(0);
  });
});

describe("[based on attribute] or fromSelf", () => {
  beforeEach(() => {
    tester.fromSelf = true;
  });

  test("based on STABLE attribute, no baseline", () => {
    totalAttrCtrl.applyBonuses({
      value: 100,
      toStat: tester.basedOnField,
      isStable: true,
      description: "",
    });
    tester.basedOnStable = true;

    const expectedValue = totalAttrCtrl.getTotalStable(tester.basedOnField);
    tester.expect(expectedValue);
    tester.expectWithBasedOnField(expectedValue);

    totalAttrCtrl.applyBonuses({
      value: 40,
      toStat: tester.basedOnField,
      isStable: false,
      description: "",
    });
    tester.expect(expectedValue);
    tester.expectWithBasedOnField(expectedValue);
  });

  test("based on STABLE attribute, baseline 100", () => {
    tester.config.baseline = 100;

    totalAttrCtrl.applyBonuses({
      value: 50,
      toStat: tester.basedOnField,
      isStable: true,
      description: "",
    });
    tester.basedOnStable = true;
    tester.expect(0);

    totalAttrCtrl.applyBonuses({
      value: 60,
      toStat: tester.basedOnField,
      isStable: false,
      description: "",
    });
    tester.basedOnStable = true;
    tester.expect(0);

    totalAttrCtrl.applyBonuses({
      value: 80,
      toStat: tester.basedOnField,
      isStable: true,
      description: "",
    });
    tester.basedOnStable = true;
    tester.expect(totalAttrCtrl.getTotalStable(tester.basedOnField) - tester.config.baseline);
  });

  test("based on STABLE & UNSTABLE attribute, no baseline", () => {
    totalAttrCtrl.applyBonuses({
      value: 100,
      toStat: tester.basedOnField,
      isStable: true,
      description: "",
    });
    tester.basedOnStable = false;
    const expectedValue = totalAttrCtrl.getTotal(tester.basedOnField);
    tester.expect(expectedValue);
    tester.expectWithBasedOnField(expectedValue);

    totalAttrCtrl.applyBonuses({
      value: 40,
      toStat: tester.basedOnField,
      isStable: false,
      description: "",
    });
    tester.basedOnStable = false;
    const newExpectedValue = totalAttrCtrl.getTotal(tester.basedOnField);
    tester.expect(newExpectedValue);
    tester.expectWithBasedOnField(newExpectedValue);
  });

  test("based on STABLE & UNSTABLE attribute, baseline 100", () => {
    tester.config.baseline = 100;

    totalAttrCtrl.applyBonuses({
      value: 50,
      toStat: tester.basedOnField,
      isStable: true,
      description: "",
    });
    tester.basedOnStable = false;
    tester.expect(0);

    totalAttrCtrl.applyBonuses({
      value: 70,
      toStat: tester.basedOnField,
      isStable: false,
      description: "",
    });
    tester.basedOnStable = false;
    tester.expect(totalAttrCtrl.getTotal(tester.basedOnField) - tester.config.baseline);
  });
});
