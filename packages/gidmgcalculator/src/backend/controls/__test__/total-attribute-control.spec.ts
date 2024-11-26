import { ArtifactCalc, WeaponCalc } from "@Src/backend/common-utils";
import { LEVELS } from "@Src/backend/constants";
import { AppCharacter, AttributeStat, Level } from "@Src/backend/types";
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

let totalAttrCtrl: TotalAttributeControl;

beforeEach(() => {
  totalAttrCtrl = new TotalAttributeControl();
});

describe("constructor", () => {
  test("no params", () => {
    totalAttrCtrl = new TotalAttributeControl();
    expect(totalAttrCtrl["totalAttr"]).toEqual(__genInternalTotalAttr());
  });

  test("with inital total attribute", () => {
    const totalAttr = __genInternalTotalAttr();
    totalAttr.atk_.base = 10;

    totalAttrCtrl = new TotalAttributeControl(totalAttr);
    expect(totalAttrCtrl["totalAttr"]).toEqual(totalAttr);
  });
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
    expect(totalAttrCtrl["getCharacterStats"](appChar, LEVELS[i])).toEqual(expected);
  }
});

test("clone", () => {
  const expected = __genInternalTotalAttr();

  expect(totalAttrCtrl["totalAttr"]).toEqual(expected);

  expected.atk.base += 200;
  totalAttrCtrl["totalAttr"].atk.base += 200;

  expect(totalAttrCtrl["totalAttr"]).toEqual(expected);

  const newCtrl = totalAttrCtrl.clone();

  expect(newCtrl["totalAttr"]).toEqual(expected);
});

describe("construct", () => {
  function __getExpectedAfterConstructWithCharacter(charLevel: Level, appChar: AppCharacter) {
    const characterStats = totalAttrCtrl["getCharacterStats"](appChar, charLevel);
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

  test("with only character", () => {
    const { char, appChar } = __genCalculationInfo();

    totalAttrCtrl.construct(char, appChar);

    const expected = __getExpectedAfterConstructWithCharacter(char.level, appChar);

    expect(totalAttrCtrl["totalAttr"]).toEqual(expected);
  });

  test("equip weapon (construct with character & weapon should be the same)", () => {
    const { char, appChar } = __genCalculationInfo();
    const rootCtrl = new TotalAttributeControl();
    rootCtrl.construct(char, appChar);

    const { weapon: sword, appWeapon: appSword } = __genWeaponInfo();

    totalAttrCtrl = rootCtrl.clone();
    totalAttrCtrl["equipWeapon"](sword, appSword);

    const expectedSword = __getExpectedAfterConstructWithCharacter(char.level, appChar);

    expectedSword.atk.base += WeaponCalc.getMainStatValue(sword.level, appSword.mainStatScale);

    if (appSword.subStat) {
      expectedSword[appSword.subStat.type].stableBonus += WeaponCalc.getSubStatValue(
        sword.level,
        appSword.subStat.scale
      );
    }

    expect(totalAttrCtrl["totalAttr"]).toEqual(expectedSword);

    // test another weapon

    const { weapon: bow, appWeapon: appBow } = __genWeaponInfo(__EMockWeapon.BOW);

    totalAttrCtrl = rootCtrl.clone();
    totalAttrCtrl["equipWeapon"](bow, appBow);

    const expectedBow = __getExpectedAfterConstructWithCharacter(char.level, appChar);

    expectedBow.atk.base += WeaponCalc.getMainStatValue(bow.level, appBow.mainStatScale);

    if (appBow.subStat) {
      expectedBow[appBow.subStat.type].stableBonus += WeaponCalc.getSubStatValue(bow.level, appBow.subStat.scale);
    }

    expect(totalAttrCtrl["totalAttr"]).toEqual(expectedBow);
  });

  test("equip artifacts (construct with character & artifacts should be the same)", () => {
    const { char, appChar } = __genCalculationInfo();
    totalAttrCtrl.construct(char, appChar);

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
        ],
      },
    ];

    totalAttrCtrl["equipArtifacts"](artifacts);

    const expected = __getExpectedAfterConstructWithCharacter(char.level, appChar);

    expected.hp.stableBonus = ArtifactCalc.mainStatValueOf(artifacts[0]) + 1000;
    expected.em.stableBonus = 100;

    expect(totalAttrCtrl["totalAttr"]).toEqual(expected);
  });
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
