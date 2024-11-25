import { AttributeStat } from "@Src/backend/types";
import { TotalAttributeControl } from "../total-attribute-control";
import { $AppCharacter } from "@Src/services";
import { characters, EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { LEVELS } from "@Src/backend/constants";
import { ASCENSION_RANKS } from "@UnitTest/test-constants";
import { genCalculationInfo } from "@UnitTest/test-utils";

type InternalTotalAttribute = Record<
  AttributeStat,
  {
    base: number;
    stableBonus: number;
    unstableBonus: number;
  }
>;

let totalAttrCtrl: TotalAttributeControl;

beforeAll(() => {
  $AppCharacter.populate(characters);
});

beforeEach(() => {
  totalAttrCtrl = new TotalAttributeControl();
});

describe("constructor", () => {
  test("no params", () => {
    totalAttrCtrl = new TotalAttributeControl();
    expect(totalAttrCtrl["totalAttr"]).toEqual(genInternalTotalAttr());
  });

  test("with inital total attribute", () => {
    const totalAttr = genInternalTotalAttr();
    totalAttr.atk_.base = 10;

    totalAttrCtrl = new TotalAttributeControl(totalAttr);
    expect(totalAttrCtrl["totalAttr"]).toEqual(totalAttr);
  });
});

test("getCharacterStats", () => {
  const appChar = $AppCharacter.get(EMockCharacter.BASIC);
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
    const ascension = ASCENSION_RANKS.find((rank) => rank.levels.includes(LEVELS[i]))!.value;
    const expected: ReturnType<TotalAttributeControl["getCharacterStats"]> = {
      hp,
      atk,
      def,
      ascensionStat: appChar.statBonus.value * ascensionToStatBonusScale[ascension],
    };
    expect(totalAttrCtrl["getCharacterStats"](appChar, LEVELS[i])).toEqual(expected);
  }
});

describe("construct", () => {
  test("with only char & appChar", () => {
    const { char, appChar } = genCalculationInfo();

    totalAttrCtrl.construct(char, appChar);

    const expected = genInternalTotalAttr();
    const characterStats = totalAttrCtrl["getCharacterStats"](appChar, char.level);

    expected.hp.base = characterStats.hp;
    expected.atk.base = characterStats.atk;
    expected.def.base = characterStats.def;
    expected.cRate_.base = 5;
    expected.cDmg_.base = 50;
    expected.er_.base = 100;
    expected.caAtkSpd_.base = 100;
    expected.naAtkSpd_.base = 100;
    expected[appChar.statBonus.type].base += characterStats.ascensionStat;

    expect(totalAttrCtrl["totalAttr"]).toEqual(expected);
  });
});

function genInternalTotalAttr(): InternalTotalAttribute {
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
