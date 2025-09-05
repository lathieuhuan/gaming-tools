import { ArtifactCalc, WeaponCalc } from "@/calculation/utils/calc-utils";
import { LEVELS } from "@/calculation/constants";
import { AppCharacter, ArtifactAttribute, AttributeStat, Level } from "@/calculation/types";
import { $AppCharacter } from "@/services";
import { Artifact } from "@/types";
import { __EMockArtifactSet } from "@UnitTest/mocks/artifacts.mock";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __EMockWeapon } from "@UnitTest/mocks/weapons.mock";
import { __findAscensionByLevel, __genMutableTeamDataTester, __genWeaponInfo } from "@UnitTest/test-utils";
import { TotalAttributeControl } from "../TotalAttributeControl";

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
    return new Tester(JSON.parse(JSON.stringify(this["totalAttr"])));
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

test("static: getArtifactAttributes => ArtifactAttributeControl", () => {
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
  const baseStats = {
    hp_base: 0,
    atk_base: 200,
    def_base: 0,
  };
  const artAttrCtrl = TotalAttributeControl.getArtifactAttributes(artifacts);

  const expectedHp = 1000 + ArtifactCalc.mainStatValueOf(artifacts[0]);
  const expected: ArtifactAttribute = {
    hp: expectedHp,
    atk: 0,
    atk_: 10,
    def: 0,
    em: 100,
  };

  expect(artAttrCtrl["artAttr"]).toEqual(expected);

  expect(artAttrCtrl.finalize(baseStats)).toEqual({
    hp: expectedHp,
    atk: 200 * 0.1, // <= atk_ 10(%)
    // atk_: 10 is removed
    def: 0,
    em: 100,
  });
});

describe("construct", () => {
  test("with only character", () => {
    const teamData = __genMutableTeamDataTester();
    const { activeMember, activeAppMember } = teamData;

    tester.construct(activeMember, activeAppMember);
    tester._expect(__getExpectedAfterConstructWithCharacter(activeMember.level, activeAppMember));
  });
});

test("equip weapon (construct with character & weapon should be the same)", () => {
  const teamData = __genMutableTeamDataTester();
  const { activeMember, activeAppMember } = teamData;

  const coreTester = new Tester();
  coreTester.construct(activeMember, activeAppMember);

  const { weapon: sword, appWeapon: appSword } = __genWeaponInfo();

  tester = coreTester._clone();
  tester["equipWeapon"](sword, appSword);

  const expectedSword = __getExpectedAfterConstructWithCharacter(activeMember.level, activeAppMember);

  expectedSword.atk.base += WeaponCalc.getMainStatValue(sword.level, appSword.mainStatScale);

  if (appSword.subStat) {
    expectedSword[appSword.subStat.type].stableBonus += WeaponCalc.getSubStatValue(sword.level, appSword.subStat.scale);
  }

  tester._expect(expectedSword);

  // test another weapon

  const { weapon: bow, appWeapon: appBow } = __genWeaponInfo(__EMockWeapon.BOW);

  tester = coreTester._clone();
  tester["equipWeapon"](bow, appBow);

  const expectedBow = __getExpectedAfterConstructWithCharacter(activeMember.level, activeAppMember);

  expectedBow.atk.base += WeaponCalc.getMainStatValue(bow.level, appBow.mainStatScale);

  if (appBow.subStat) {
    expectedBow[appBow.subStat.type].stableBonus += WeaponCalc.getSubStatValue(bow.level, appBow.subStat.scale);
  }

  tester._expect(expectedBow);
});

test("equip artifacts (construct with character & artifacts should be the same)", () => {
  const teamData = __genMutableTeamDataTester();
  const { activeMember, activeAppMember } = teamData;

  tester.construct(activeMember, activeAppMember);

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

  const expected = __getExpectedAfterConstructWithCharacter(activeMember.level, activeAppMember);

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

function __getExpectedAfterConstructWithCharacter(charLevel: Level, appCharacter: AppCharacter) {
  const characterStats = tester["getCharacterStats"](appCharacter, charLevel);
  const expected = __genInternalTotalAttr();

  expected.hp.base = characterStats.hp;
  expected.atk.base = characterStats.atk;
  expected.def.base = characterStats.def;
  expected.cRate_.base = 5;
  expected.cDmg_.base = 50;
  expected.er_.base = 100;
  expected.caAtkSpd_.base = 100;
  expected.naAtkSpd_.base = 100;
  expected[appCharacter.statBonus.type].base += characterStats.ascensionStat;

  return expected;
}
