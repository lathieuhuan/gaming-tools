import { TotalAttributeControl } from "@Src/backend/controls";
import {
  AttributeStat,
  BareBonus,
  EffectExtra,
  EntityBonusBasedOn,
  EntityBonusBasedOnField,
  EntityBonusCore,
  EntityBonusValueByOption,
  LevelableTalentType,
} from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { characters, EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { genCalculationInfo } from "@UnitTest/test-utils";
import { BareBonusGetter } from "../bare-bonus-getter";
import { ApplyExtraTester, BareBonusGetterTester, BasedOnTester, GetStackValueTester, MaxTester } from "./test-utils";

let tester: BareBonusGetterTester;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  tester = new BareBonusGetterTester(genCalculationInfo());
});

test("scaleRefi", () => {
  const scaleRefi = tester["scaleRefi"];

  expect(scaleRefi(7, 2, 3)).toBe(7 + 2 * 3);
  expect(scaleRefi(6, 2)).toBe(6 + 2 * (6 / 3));
  expect(scaleRefi(6)).toBe(6);
  expect(scaleRefi(6, undefined, 100)).toBe(6);
});

describe("getIndexOfBonusValue", () => {
  let getIndexOfBonusValue: BareBonusGetter["getIndexOfBonusValue"];

  beforeEach(() => {
    getIndexOfBonusValue = tester["getIndexOfBonusValue"];
  });

  /**
   * Note: party means partyData only.
   * WHOLE party means the character and partyData.
   */
  test("DEFAULT: optIndex type INPUT, inpIndex is 0", () => {
    const input = 2;
    expect(getIndexOfBonusValue({}, [input])).toBe(input - 1); // input 1 will be mapped to index 0, etc
    expect(getIndexOfBonusValue({}, [0])).toBe(-1);
    expect(getIndexOfBonusValue({})).toBe(-1);
  });

  test("optIndex config as number: inpIndex to get value from inputs", () => {
    const input = 2;
    expect(getIndexOfBonusValue({ optIndex: 0 }, [input])).toBe(input - 1);
    expect(getIndexOfBonusValue({ optIndex: 1 }, [-2, input])).toBe(input - 1);
    expect(getIndexOfBonusValue({ optIndex: 1 })).toBe(-1);
  });

  test("optIndex from inputs (INPUT)", () => {
    const optIndex: EntityBonusValueByOption["optIndex"] = {
      source: "INPUT",
      inpIndex: 0,
    };
    const input = 2;

    expect(getIndexOfBonusValue({ optIndex }, [input])).toBe(input - 1);
    expect(getIndexOfBonusValue({ optIndex })).toBe(-1);
  });

  test("optIndex from character's talent level (LEVEL)", () => {
    const level = 10;
    const talents: LevelableTalentType[] = ["NAs", "ES", "EB"];

    for (const talent of talents) {
      const optIndex: EntityBonusValueByOption["optIndex"] = {
        source: "LEVEL",
        talent: talent,
      };
      tester.updateCharacter(talent, level);

      expect(getIndexOfBonusValue({ optIndex })).toBe(level - 1);
    }
  });

  test("optIndex from the number of WHOLE party's all distinct elements (ELEMENT)", () => {
    const optIndex: EntityBonusValueByOption["optIndex"] = {
      source: "ELEMENT",
    };

    tester.changeCharacter(EMockCharacter.BASIC);
    expect(getIndexOfBonusValue({ optIndex })).toBe(0);

    tester.changeParty([$AppCharacter.get(EMockCharacter.BASIC)]);
    expect(getIndexOfBonusValue({ optIndex })).toBe(0);

    tester.changeParty([$AppCharacter.get(EMockCharacter.CATALYST)]);
    expect(getIndexOfBonusValue({ optIndex })).toBe(1);
  });

  test("optIndex from the number of WHOLE party's some distinct elements (ELEMENT)", () => {
    const optIndex: EntityBonusValueByOption["optIndex"] = {
      source: "ELEMENT",
      elements: ["pyro"],
    };

    tester.changeCharacter(EMockCharacter.BASIC);
    expect(getIndexOfBonusValue({ optIndex })).toBe(0);

    tester.changeParty([$AppCharacter.get(EMockCharacter.CATALYST)]);
    expect(getIndexOfBonusValue({ optIndex })).toBe(0);

    optIndex.elements = ["pyro", "electro"];
    expect(getIndexOfBonusValue({ optIndex })).toBe(1);

    optIndex.elements = ["pyro", "electro", "anemo"];
    expect(getIndexOfBonusValue({ optIndex })).toBe(1);
  });

  test("optIndex from the number of party's members whose elements are different from the character (MEMBER)", () => {
    const electroMember = $AppCharacter.get(EMockCharacter.CATALYST);
    const optIndex: EntityBonusValueByOption["optIndex"] = {
      source: "MEMBER",
      element: "DIFFERENT",
    };

    tester.changeCharacter(EMockCharacter.BASIC);
    expect(getIndexOfBonusValue({ optIndex })).toBe(-1);

    tester.changeParty([electroMember]);
    expect(getIndexOfBonusValue({ optIndex })).toBe(0);

    tester.changeParty([electroMember, $AppCharacter.get(EMockCharacter.BASIC)]);
    expect(getIndexOfBonusValue({ optIndex })).toBe(0);

    tester.changeParty([electroMember, $AppCharacter.get(EMockCharacter.TARTAGLIA)]);
    expect(getIndexOfBonusValue({ optIndex })).toBe(1);
  });

  test("optIndex from the number of WHOLE party's members whose elements are aligned with the condition (MEMBER)", () => {
    const electroMember = $AppCharacter.get(EMockCharacter.CATALYST);
    const pyroMember = $AppCharacter.get(EMockCharacter.BASIC);
    const optIndex: EntityBonusValueByOption["optIndex"] = {
      source: "MEMBER",
      element: "pyro",
    };

    tester.changeCharacter(EMockCharacter.BASIC);
    expect(getIndexOfBonusValue({ optIndex })).toBe(0);

    tester.changeParty([pyroMember]);
    expect(getIndexOfBonusValue({ optIndex })).toBe(1);

    tester.changeParty([pyroMember, electroMember]);
    expect(getIndexOfBonusValue({ optIndex })).toBe(1);

    optIndex.element = ["pyro", "electro"];
    expect(getIndexOfBonusValue({ optIndex })).toBe(2);
  });
});

test("getExtra", () => {
  const extraValue = 3;
  const checkInput = 2;
  const extra: EffectExtra = {
    value: extraValue,
    checkInput: checkInput,
  };
  const support = {
    inputs: [1],
    fromSelf: true,
  };

  expect(tester["getExtra"](undefined, support)).toBe(0);
  expect(tester["getExtra"](extra, support)).toBe(0);

  support.inputs = [checkInput];
  expect(tester["getExtra"](extra, support)).toBe(extraValue);
});

describe("getBasedOn", () => {
  let basedOnField: AttributeStat;
  let config: Exclude<EntityBonusBasedOn, EntityBonusBasedOnField>;
  let expectedBasedOn: ReturnType<(typeof tester)["getBasedOn"]>;
  let totalAttrCtrl: TotalAttributeControl;
  let tester: BasedOnTester;

  function expectBasedOn(configParam: EntityBonusBasedOn = config, basedOnStable?: boolean) {
    tester.expectBasedOn(configParam, basedOnStable).toEqual(expectedBasedOn);
  }

  beforeEach(() => {
    tester = new BasedOnTester();
  });

  describe("not fromSelf (based on inputs)", () => {
    beforeEach(() => {
      basedOnField = "atk";
      config = {
        field: basedOnField,
      };
      expectedBasedOn = {
        field: basedOnField,
        value: 1,
      };
      tester.fromSelf = false;
    });

    test("altIndex default to 0, no baseline", () => {
      const input = 100;

      tester.inputs = [input];
      expectedBasedOn.value = input;
      expectBasedOn();
      expectBasedOn(config.field);

      // when no input found, value should be 1
      tester.inputs = [];
      expectedBasedOn.value = 1;
      expectBasedOn();
    });

    test("altIndex 1, no baseline", () => {
      const input = 100;
      config.altIndex = 1;

      tester.inputs = [-3, input];
      expectedBasedOn.value = input;
      expectBasedOn();
    });

    test("baseline 100", () => {
      const input = 150;
      const baseline = 100;
      config.baseline = baseline;

      tester.inputs = [input];
      expectedBasedOn.value = input - baseline;
      expectBasedOn();

      tester.inputs = [baseline - 50];
      expectedBasedOn.value = 0;
      expectBasedOn();

      config.altIndex = 1;

      tester.inputs = [-2, input];
      expectedBasedOn.value = input - baseline;
      expectBasedOn();

      tester.inputs = [-1, baseline - 50];
      expectedBasedOn.value = 0;
      expectBasedOn();
    });
  });

  describe("fromSelf (based on TotalAttribute)", () => {
    beforeEach(() => {
      totalAttrCtrl = new TotalAttributeControl();
      tester = new BasedOnTester(totalAttrCtrl);

      basedOnField = "atk";
      config = {
        field: basedOnField,
      };
      expectedBasedOn = {
        field: basedOnField,
        value: 1,
      };
      tester.fromSelf = true;
    });

    test("based on total STABLE attribute, no baseline", () => {
      totalAttrCtrl.applyBonuses({
        value: 100,
        toStat: basedOnField,
        isStable: true,
        description: "",
      });
      expectedBasedOn.value = totalAttrCtrl.getTotalStable(basedOnField);
      expectBasedOn(config, true);
      expectBasedOn(config.field, true);

      totalAttrCtrl.applyBonuses({
        value: 40,
        toStat: basedOnField,
        isStable: false,
        description: "",
      });
      expectedBasedOn.value = totalAttrCtrl.getTotalStable(basedOnField);
      expectBasedOn(config, true);
      expectBasedOn(config.field, true);
    });

    test("based on total STABLE attribute, baseline 100", () => {
      config.baseline = 100;

      totalAttrCtrl.applyBonuses({
        value: 50,
        toStat: basedOnField,
        isStable: true,
        description: "",
      });
      expectedBasedOn.value = 0;
      expectBasedOn(config, true);

      totalAttrCtrl.applyBonuses({
        value: 60,
        toStat: basedOnField,
        isStable: false,
        description: "",
      });
      expectedBasedOn.value = 0;
      expectBasedOn(config, true);

      totalAttrCtrl.applyBonuses({
        value: 80,
        toStat: basedOnField,
        isStable: true,
        description: "",
      });
      expectedBasedOn.value = totalAttrCtrl.getTotalStable(basedOnField) - config.baseline;
      expectBasedOn(config, true);
    });

    test("based on total (stable & unstable) attribute, no baseline", () => {
      totalAttrCtrl.applyBonuses({
        value: 100,
        toStat: basedOnField,
        isStable: true,
        description: "",
      });
      expectedBasedOn.value = totalAttrCtrl.getTotal(basedOnField);
      expectBasedOn(config, false);
      expectBasedOn(config.field, false);

      totalAttrCtrl.applyBonuses({
        value: 40,
        toStat: basedOnField,
        isStable: false,
        description: "",
      });
      expectedBasedOn.value = totalAttrCtrl.getTotal(basedOnField);
      expectBasedOn(config, false);
      expectBasedOn(config.field, false);
    });

    test("based on total (stable & unstable) attribute, baseline 100", () => {
      config.baseline = 100;

      totalAttrCtrl.applyBonuses({
        value: 50,
        toStat: basedOnField,
        isStable: true,
        description: "",
      });
      expectedBasedOn.value = 0;
      expectBasedOn(config, false);

      totalAttrCtrl.applyBonuses({
        value: 70,
        toStat: basedOnField,
        isStable: false,
        description: "",
      });
      expectedBasedOn.value = totalAttrCtrl.getTotal(basedOnField) - config.baseline;
      expectBasedOn(config, false);
    });
  });
});

describe("applyMax", () => {
  let tester: MaxTester;

  beforeEach(() => {
    tester = new MaxTester();
  });

  test("max config as number", () => {
    expect(tester["applyMax"](17, 10)).toBe(10);
  });

  test("max is based on inputs", () => {
    const input = 10;

    tester.maxConfig = {
      value: 100,
      basedOn: {
        // field here is unused
        field: "atk",
        altIndex: 1,
      },
    };
    tester.inputs = [-2, input];
    tester.fromSelf = false;

    tester.expectMax(tester.maxConfig.value * input);
  });

  test("max is based on TotalAttribute", () => {
    const totalAttrCtrl = new TotalAttributeControl();
    const attributeValue = 1000;
    const attributeType = "atk";
    tester = tester.clone(totalAttrCtrl);

    totalAttrCtrl.applyBonuses({
      value: attributeValue,
      toStat: attributeType,
      description: "",
    });

    tester.maxConfig = {
      value: 2,
      basedOn: {
        field: attributeType,
      },
    };
    tester.fromSelf = true;
    tester.expectMax(tester.maxConfig.value * totalAttrCtrl.getTotal(attributeType));
  });

  test("max has extra", () => {
    tester.maxConfig = {
      value: 2,
      extras: {
        value: 1,
      },
    };
    tester.expectMax(3);

    tester.maxConfig = {
      value: 3,
      extras: {
        value: 1,
        grantedAt: "C2",
      },
    };
    tester.expectMax(3);

    tester.updateCharacter("cons", 5);
    tester.expectMax(4);
  });

  test("max increased based on refi", () => {
    tester.maxConfig = {
      value: 6,
    };
    tester.refi = 1;
    tester.expectMax(6 + (6 / 3) * tester.refi);

    tester.maxConfig = {
      value: 6,
      incre: 3,
    };
    tester.refi = 3;
    tester.expectMax(6 + 3 * tester.refi);
  });
});

describe("applyExtra", () => {
  let tester: ApplyExtraTester;

  beforeEach(() => {
    tester = new ApplyExtraTester();
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
    const totalAttrCtrl = new TotalAttributeControl();
    tester = tester.clone(totalAttrCtrl);

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
});

describe("getStackValue", () => {
  let tester: GetStackValueTester;

  beforeEach(() => {
    tester = new GetStackValueTester();
  });

  test("stack be 0 when stack calculation is involved party and there's no party", () => {
    // ELEMENT

    tester.stack = {
      type: "MEMBER",
      element: "DIFFERENT",
    };
    tester.expect(0);

    tester.stack = {
      type: "MEMBER",
      element: "SAME_EXCLUDED",
    };
    tester.expect(0);

    tester.stack = {
      type: "MEMBER",
      element: "SAME_INCLUDED",
    };
    tester.expect(0);

    tester.stack = {
      type: "MEMBER",
      element: "pyro",
    };
    tester.expect(0);

    // ENERGY

    tester.stack = {
      type: "ENERGY",
      scope: "ACTIVE",
    };
    tester.expect(0);

    tester.stack = {
      type: "ENERGY",
      scope: "PARTY",
    };
    tester.expect(0);

    // NATION

    tester.stack = {
      type: "NATION",
      nation: "DIFFERENT",
    };
    tester.expect(0);

    tester.stack = {
      type: "NATION",
      nation: "SAME_EXCLUDED",
    };
    tester.expect(0);

    tester.stack = {
      type: "NATION",
      nation: "LIYUE",
    };
    tester.expect(0);

    // OTHERS

    tester.stack = {
      type: "RESOLVE",
    };
    tester.expect(0);

    tester.stack = {
      type: "MIX",
    };
    tester.expect(0);
  });

  describe("type INPUT: stack calculated from inputs", () => {
    beforeEach(() => {
      tester.fromSelf = true;
    });

    test("fromSelf, index default to 0", () => {
      tester.stack = {
        type: "INPUT",
      };
      tester.inputs = [10];
      tester.expect(10);
    });

    test("fromSelf, index 1", () => {
      tester.stack = {
        type: "INPUT",
        index: 1,
      };
      tester.inputs = [-2, 30];
      tester.expect(30);
    });

    test("not fromSelf, altIndex default to 0", () => {
      tester.fromSelf = false;
      tester.stack = {
        type: "INPUT",
      };
      tester.inputs = [20];
      tester.expect(20);
    });

    test("not fromSelf, altIndex 2", () => {
      tester.fromSelf = false;
      tester.stack = {
        type: "INPUT",
        altIndex: 2,
      };
      tester.inputs = [-4, -1, 15];
      tester.expect(15);
    });
  });

  describe("type MEMBER: stack calculated from inputs", () => {
    test("element DIFFERENT", () => {
      tester.stack = {
        type: "MEMBER",
        element: "DIFFERENT",
      };

      tester.changeCharacter(EMockCharacter.BASIC);
      tester.expect(0);

      tester.changeParty([$AppCharacter.get(EMockCharacter.BASIC)]);
      tester.expect(0);

      tester.changeParty([$AppCharacter.get(EMockCharacter.CATALYST)]);
      tester.expect(1);
    });
  });
});
