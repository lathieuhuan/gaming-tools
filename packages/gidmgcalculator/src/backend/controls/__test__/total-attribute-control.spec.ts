import { ArtifactCalc, WeaponCalc } from "@Src/backend/common-utils";
import { LEVELS } from "@Src/backend/constants";
import { AppCharacter, ArtifactAttribute, AttributeStat, Level } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { Artifact } from "@Src/types";
import { __EMockArtifactSet } from "@UnitTest/mocks/artifacts.mock";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __EMockWeapon } from "@UnitTest/mocks/weapons.mock";
import { __findAscensionByLevel, __genCalculationInfo, __genWeaponInfo } from "@UnitTest/test-utils";
import { TotalAttributeControl } from "../total-attribute-control";

type InternalTotalAttribute = Record<
  AttributeStat,
  {
    base: number;
    stableBonus: number;
    unstableBonus: number;
  }
>;

class Tester extends TotalAttributeControl {
  _expect(value: InternalTotalAttribute) {
    expect(this["totalAttr"]).toEqual(value);
  }

  _clone() {
    return new Tester(structuredClone(this["totalAttr"]));
  }
}

let tester: Tester;

beforeEach(() => {
  tester = new Tester();
});

describe("constructor", () => {
  test("no params", () => {
    tester._expect(__genInternalTotalAttr());
  });

  test("with inital total attribute", () => {
    const totalAttr = __genInternalTotalAttr();
    totalAttr.atk_.base = 10;

    tester = new Tester(totalAttr);
    tester._expect(totalAttr);
  });
});

test("clone", () => {
  const control = new TotalAttributeControl();
  const expected = __genInternalTotalAttr();

  expect(control["totalAttr"]).toEqual(expected);

  expected.atk.base += 200;
  control["totalAttr"].atk.base += 200;

  expect(control["totalAttr"]).toEqual(expected);

  const newControl = control.clone();

  expect(newControl["totalAttr"]).toEqual(expected);
});

test("getCharacterStats", () => {
  const appChar = $AppCharacter.get(__EMockCharacter.BASIC);
  const ascensionToStatBonusScale: Record<number, number> = {
    0: 0,
    1: 0,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 4,
  };

  for (let i = 0; i < LEVELS.length; i++) {
    const [hp, atk, def] = appChar.stats[i];
    const ascension = __findAscensionByLevel(LEVELS[i]);
    const expected: ReturnType<TotalAttributeControl["getCharacterStats"]> = {
      hp,
      atk,
      def,
      ascensionStat: appChar.statBonus.value * ascensionToStatBonusScale[ascension],
    };
    expect(tester["getCharacterStats"](appChar, LEVELS[i])).toEqual(expected);
  }
});

test("addBase", () => {
  tester["addBase"]("atk", 100);
  const expected = __genInternalTotalAttr();
  expected.atk.base = 100;

  tester._expect(expected);
});

test("getBase", () => {
  tester["totalAttr"].atk = {
    base: 100,
    stableBonus: 20,
    unstableBonus: 30,
  };
  expect(tester.getBase("atk")).toBe(100);
});

test("getTotal", () => {
  tester["totalAttr"].atk = {
    base: 100,
    stableBonus: 20,
    unstableBonus: 30,
  };
  expect(tester.getTotal("atk")).toBe(150);
});

test("getTotalStable", () => {
  tester["totalAttr"].atk = {
    base: 100,
    stableBonus: 20,
    unstableBonus: 30,
  };
  expect(tester.getTotalStable("atk")).toBe(120);
});

test("static: getArtifactAttribute", () => {
  const artifacts: Artifact[] = [
    {
      ID: 1,
      code: __EMockArtifactSet.DEFAULT,
      level: 1,
      rarity: 5,
      type: "flower",
      mainStatType: "hp",
      subStats: [
        { type: "hp", value: 1000 },
        { type: "em", value: 100 },
        { type: "atk_", value: 10 },
      ],
    },
  ];

  const expected: ArtifactAttribute = {
    hp: 1000,
    atk: 0,
    atk_: 10,
    def: 0,
    em: 100,
  };
  expected[artifacts[0].mainStatType] += ArtifactCalc.mainStatValueOf(artifacts[0]);

  expect(TotalAttributeControl.getArtifactAttribute(artifacts)).toEqual(expected);
});

test("static: finalizeArtifactAttribute", () => {
  const artifacts: Artifact[] = [
    {
      ID: 1,
      code: __EMockArtifactSet.DEFAULT,
      level: 1,
      rarity: 5,
      type: "flower",
      mainStatType: "hp",
      subStats: [
        { type: "hp", value: 1000 },
        { type: "atk", value: 100 },
        { type: "atk_", value: 10 },
      ],
    },
  ];
  const calcHp = ArtifactCalc.mainStatValueOf(artifacts[0]) + 1000;

  const finalized = TotalAttributeControl.getArtifactAttribute(artifacts);

  expect(finalized).toEqual({
    hp: calcHp,
    atk: 100,
    atk_: 10,
    def: 0,
  });

  TotalAttributeControl.finalizeArtifactAttribute(finalized, {
    hp_base: 10_000,
    atk_base: 300,
    def_base: 0,
  });

  expect(finalized).toEqual({
    hp: calcHp,
    atk: 100 + 300 * 0.1, // 0.1 <=> 10% bonus (atk_)
    // atk_ is removed
    def: 0,
  });
});

test("finalizeArtifactAttribute", () => {
  const artifacts: Artifact[] = [
    {
      ID: 1,
      code: __EMockArtifactSet.DEFAULT,
      level: 1,
      rarity: 5,
      type: "flower",
      mainStatType: "hp",
      subStats: [
        { type: "hp", value: 1000 },
        { type: "atk", value: 100 },
        { type: "atk_", value: 10 },
      ],
    },
  ];
  const finalized = TotalAttributeControl.getArtifactAttribute(artifacts);

  tester["totalAttr"].atk.base = 500;
  tester.finalizeArtifactAttribute(finalized);

  expect(finalized).toEqual({
    hp: ArtifactCalc.mainStatValueOf(artifacts[0]) + 1000,
    atk: 100 + 500 * 0.1, // 0.1 <=> 10% bonus (atk_)
    // atk_ is removed
    def: 0,
  });
});

describe("construct", () => {
  test("with only character", () => {
    const { char, appChar } = __genCalculationInfo();

    tester.construct(char, appChar);
    tester._expect(__getExpectedAfterConstructWithCharacter(char.level, appChar));
  });
});

test("equip weapon (construct with character & weapon should be the same)", () => {
  const { char, appChar } = __genCalculationInfo();
  const coreTester = new Tester();
  coreTester.construct(char, appChar);

  const { weapon: sword, appWeapon: appSword } = __genWeaponInfo();

  tester = coreTester._clone();
  tester["equipWeapon"](sword, appSword);

  const expectedSword = __getExpectedAfterConstructWithCharacter(char.level, appChar);

  expectedSword.atk.base += WeaponCalc.getMainStatValue(sword.level, appSword.mainStatScale);

  if (appSword.subStat) {
    expectedSword[appSword.subStat.type].stableBonus += WeaponCalc.getSubStatValue(sword.level, appSword.subStat.scale);
  }

  tester._expect(expectedSword);

  // test another weapon

  const { weapon: bow, appWeapon: appBow } = __genWeaponInfo(__EMockWeapon.BOW);

  tester = coreTester._clone();
  tester["equipWeapon"](bow, appBow);

  const expectedBow = __getExpectedAfterConstructWithCharacter(char.level, appChar);

  expectedBow.atk.base += WeaponCalc.getMainStatValue(bow.level, appBow.mainStatScale);

  if (appBow.subStat) {
    expectedBow[appBow.subStat.type].stableBonus += WeaponCalc.getSubStatValue(bow.level, appBow.subStat.scale);
  }

  tester._expect(expectedBow);
});

test("equip artifacts (construct with character & artifacts should be the same)", () => {
  const { char, appChar } = __genCalculationInfo();
  tester.construct(char, appChar);

  const artifacts: Artifact[] = [
    {
      ID: 1,
      code: __EMockArtifactSet.DEFAULT,
      level: 1,
      rarity: 5,
      type: "flower",
      mainStatType: "hp",
      subStats: [
        { type: "hp", value: 1000 },
        { type: "em", value: 100 },
        { type: "atk_", value: 10 },
      ],
    },
  ];

  tester["equipArtifacts"](artifacts);

  const expected = __getExpectedAfterConstructWithCharacter(char.level, appChar);

  expected.hp.stableBonus = ArtifactCalc.mainStatValueOf(artifacts[0]) + 1000;
  expected.em.stableBonus = 100;
  expected.atk_.stableBonus = 10;

  tester._expect(expected);
});

test("applyBonuses", () => {
  tester.applyBonuses({
    value: 100,
    toStat: "atk",
    description: "",
  });
  expect(tester["totalAttr"].atk.stableBonus).toBe(100);

  tester.applyBonuses({
    value: 30,
    toStat: "atk",
    isStable: false,
    description: "",
  });
  expect(tester["totalAttr"].atk.stableBonus).toBe(100);
  expect(tester["totalAttr"].atk.unstableBonus).toBe(30);
});

test("finalize", () => {
  tester["totalAttr"].atk.base = 500;
  tester["totalAttr"].atk.stableBonus = 100;
  tester["totalAttr"].atk.unstableBonus = 50;
  tester["totalAttr"].atk_.stableBonus = 20;
  tester["totalAttr"].atk_.unstableBonus = 40;

  const percentMult = (100 + 20 + 40) / 100;
  const totalAttr = tester.finalize();

  expect(totalAttr.atk_base).toBe(500);
  expect(totalAttr.atk).toBe(500 * percentMult + 100 + 50);
  expect(totalAttr.atk_).toBe(undefined);
});

function __genInternalTotalAttr(): InternalTotalAttribute {
  return {
    hp: { base: 0, stableBonus: 0, unstableBonus: 0 },
    hp_: { base: 0, stableBonus: 0, unstableBonus: 0 },
    atk: { base: 0, stableBonus: 0, unstableBonus: 0 },
    atk_: { base: 0, stableBonus: 0, unstableBonus: 0 },
    def: { base: 0, stableBonus: 0, unstableBonus: 0 },
    def_: { base: 0, stableBonus: 0, unstableBonus: 0 },
    em: { base: 0, stableBonus: 0, unstableBonus: 0 },
    er_: { base: 0, stableBonus: 0, unstableBonus: 0 },
    shieldS_: { base: 0, stableBonus: 0, unstableBonus: 0 },
    healB_: { base: 0, stableBonus: 0, unstableBonus: 0 },
    inHealB_: { base: 0, stableBonus: 0, unstableBonus: 0 },
    cRate_: { base: 0, stableBonus: 0, unstableBonus: 0 },
    cDmg_: { base: 0, stableBonus: 0, unstableBonus: 0 },
    pyro: { base: 0, stableBonus: 0, unstableBonus: 0 },
    hydro: { base: 0, stableBonus: 0, unstableBonus: 0 },
    electro: { base: 0, stableBonus: 0, unstableBonus: 0 },
    cryo: { base: 0, stableBonus: 0, unstableBonus: 0 },
    geo: { base: 0, stableBonus: 0, unstableBonus: 0 },
    anemo: { base: 0, stableBonus: 0, unstableBonus: 0 },
    dendro: { base: 0, stableBonus: 0, unstableBonus: 0 },
    phys: { base: 0, stableBonus: 0, unstableBonus: 0 },
    naAtkSpd_: { base: 0, stableBonus: 0, unstableBonus: 0 },
    caAtkSpd_: { base: 0, stableBonus: 0, unstableBonus: 0 },
  };
}

function __getExpectedAfterConstructWithCharacter(charLevel: Level, appChar: AppCharacter) {
  const characterStats = tester["getCharacterStats"](appChar, charLevel);
  const expected = __genInternalTotalAttr();

  expected.hp.base = characterStats.hp;
  expected.atk.base = characterStats.atk;
  expected.def.base = characterStats.def;
  expected.cRate_.base = 5;
  expected.cDmg_.base = 50;
  expected.er_.base = 100;
  expected.caAtkSpd_.base = 100;
  expected.naAtkSpd_.base = 100;
  expected[appChar.statBonus.type].base += characterStats.ascensionStat;

  return expected;
}
