import { ELEMENT_TYPES } from "@Src/backend/constants";
import { AppliedAttributeBonus, AppliedBonuses, BareBonus, EntityBonusTargets } from "@Src/backend/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genCalculationInfo } from "@UnitTest/test-utils";
import { AppliedBonusesGetter } from "../../applied-bonuses-getter";

class Tester extends AppliedBonusesGetter {
  bonus: BareBonus = {
    id: "",
    value: 0,
    isStable: true,
  };
  target: EntityBonusTargets = {
    module: "ATTR",
    path: "atk_",
  };
  description = "";
  inputs: number[] = [];
  unstackableId?: string;

  _changeCharacter(name: __EMockCharacter) {
    this.record = __genCalculationInfo(name);
  }

  _apply() {
    return this["applyBonus"](this.bonus, this.target, {
      description: this.description,
      inputs: this.inputs,
      unstackableId: this.unstackableId,
    });
  }

  _expectAppliedBonuses(appliedBonuses: AppliedBonuses) {
    expect(this._apply()).toEqual(appliedBonuses);
  }
}

let tester: Tester;

beforeEach(() => {
  tester = new Tester(__genCalculationInfo());
});

test("Apply a single Attribute Bonus, to normal ATTR", () => {
  tester.bonus.value = 10;
  tester.target = {
    module: "ATTR",
    path: "atk",
  };

  tester._expectAppliedBonuses({
    attrBonuses: [
      {
        ...tester.bonus,
        toStat: "atk",
        description: tester.description,
      },
    ],
    attkBonuses: [],
  });
});

test("Apply a single Attribute Bonus, to input element (INP_ELMT)", () => {
  const elementIndex = 3;

  tester.bonus.value = 5;
  tester.target = {
    module: "ATTR",
    path: "INP_ELMT",
    // inpIndex: default to 0
  };
  tester.inputs = [elementIndex];
  tester._expectAppliedBonuses({
    attrBonuses: [
      {
        ...tester.bonus,
        toStat: ELEMENT_TYPES[elementIndex],
        description: tester.description,
      },
    ],
    attkBonuses: [],
  });

  tester.target = {
    module: "ATTR",
    path: "INP_ELMT",
    inpIndex: 1,
  };
  tester.inputs = [-2, elementIndex];
  tester._expectAppliedBonuses({
    attrBonuses: [
      {
        ...tester.bonus,
        toStat: ELEMENT_TYPES[elementIndex],
        description: tester.description,
      },
    ],
    attkBonuses: [],
  });
});

test("Apply a single Attribute Bonus, to character's element (OWN_ELMT)", () => {
  tester.bonus.value = 5;
  tester.target = {
    module: "ATTR",
    path: "OWN_ELMT",
  };
  tester._changeCharacter(__EMockCharacter.CATALYST); // Electro

  tester._expectAppliedBonuses({
    attrBonuses: [
      {
        ...tester.bonus,
        toStat: "electro",
        description: tester.description,
      },
    ],
    attkBonuses: [],
  });
});

test("Apply multiple Attribute Bonuses", () => {
  const elementIndex = 4;

  tester.bonus.value = 20;
  tester.target = {
    module: "ATTR",
    path: ["hp", "def", "INP_ELMT", "OWN_ELMT"],
    inpIndex: 1,
  };
  tester.inputs = [-2, elementIndex];
  tester._changeCharacter(__EMockCharacter.TARTAGLIA);

  const { attrBonuses } = tester._apply();

  expect(attrBonuses).toContainEqual({
    ...tester.bonus,
    toStat: "hp",
    description: tester.description,
  });
  expect(attrBonuses).toContainEqual({
    ...tester.bonus,
    toStat: "def",
    description: tester.description,
  });
  expect(attrBonuses).toContainEqual({
    ...tester.bonus,
    toStat: ELEMENT_TYPES[elementIndex],
    description: tester.description,
  });
  expect(attrBonuses).toContainEqual({
    ...tester.bonus,
    toStat: "hydro",
    description: tester.description,
  });
});

test("Apply a single Attack Bonus", () => {
  tester.bonus.value = 20;
  tester.target = {
    module: "ES",
    path: "pct_",
  };

  tester._expectAppliedBonuses({
    attrBonuses: [],
    attkBonuses: [
      {
        id: tester.bonus.id,
        value: tester.bonus.value,
        toType: "ES",
        toKey: "pct_",
        description: tester.description,
      },
    ],
  });
});

test("Apply multiple Attack Bonuses", () => {
  tester.bonus.value = 20;
  tester.target = {
    module: ["ES", "EB"],
    path: "pct_",
  };
  const { attkBonuses } = tester._apply();

  expect(attkBonuses).toContainEqual({
    id: tester.bonus.id,
    value: tester.bonus.value,
    toType: "ES",
    toKey: "pct_",
    description: tester.description,
  });
  expect(attkBonuses).toContainEqual({
    id: tester.bonus.id,
    value: tester.bonus.value,
    toType: "EB",
    toKey: "pct_",
    description: tester.description,
  });
});

test("Should not _apply bonus when there is already an existing bonus with the same unstackableId ", () => {
  tester.bonus.value = 35;
  tester.target = {
    module: "ATTR",
    path: "em",
  };

  const attrBonus: AppliedAttributeBonus = {
    ...tester.bonus,
    toStat: "em",
    description: tester.description,
  };

  tester.unstackableId = "unstackableId";
  tester._expectAppliedBonuses({
    attrBonuses: [attrBonus],
    attkBonuses: [],
  });

  tester._expectAppliedBonuses({
    attrBonuses: [],
    attkBonuses: [],
  });

  // when no unstackableId, bonus can be applied again
  tester.unstackableId = undefined;
  tester._expectAppliedBonuses({
    attrBonuses: [attrBonus],
    attkBonuses: [],
  });
});
