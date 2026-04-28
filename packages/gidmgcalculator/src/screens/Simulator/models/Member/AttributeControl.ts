import { round } from "ron-utils";

import type { AllAttributes, AttributeStat, AutoRsnElmtType } from "@/types";
import type { Member } from "./Member";

import { baseStatToCoreStat, isBaseStat, isCoreStat } from "@/logic/stat.logic";
import TypeCounter from "@/utils/TypeCounter";

const ASC_MULT_BY_ASC = [0, 38 / 182, 65 / 182, 101 / 182, 128 / 182, 155 / 182, 1];

const AUTO_RESONANCE_STATS: Record<string, { key: AttributeStat; value: number }> = {
  pyro: { key: "atk_", value: 25 },
  geo: { key: "shieldS_", value: 15 },
  hydro: { key: "hp_", value: 25 },
  dendro: { key: "em", value: 50 },
};

type InternalAttribute = {
  base: number;
  fiBonus: number;
  dyBonus: number;
};

type AddableAttributeKey = keyof Pick<InternalAttribute, "base" | "fiBonus" | "dyBonus">;

type InternalAttributes = Map<AttributeStat, InternalAttribute>;

type AttributeControlConstructOptions = {
  attrs?: InternalAttributes;
  finals?: AllAttributes;
};

export class AttributeControl {
  private attrs: InternalAttributes = new Map();

  finals: AllAttributes = new TypeCounter();

  constructor(options: AttributeControlConstructOptions = {}) {
    const { attrs = new Map(), finals = new TypeCounter() } = options;

    this.attrs = attrs;
    this.finals = finals;
  }

  init(member: Member, resonanceElmts: AutoRsnElmtType[]) {
    const { data } = member;

    this.attrs.clear();

    // ===== Base stats =====
    {
      const { hp, atk, def } = data.statBases;
      const use4starMult = member.isTraveler || data.rarity === 4;

      let levelMult = (100 + 9 * member.bareLv) / 109;
      levelMult = use4starMult ? levelMult : (levelMult * (1900 + member.bareLv)) / 1901;
      levelMult = round(levelMult, 3);

      let atkLevelMult = levelMult;

      if (member.bareLv > 90) {
        if (member.bareLv === 95) {
          atkLevelMult = use4starMult ? 9.87 : 10.184;
        } else {
          atkLevelMult = use4starMult ? 11.392 : 11.629;
        }
      }

      const ascensionMult = ASC_MULT_BY_ASC[member.ascension];

      this.add("hp", "base", hp.level * levelMult + hp.ascension * ascensionMult);
      this.add("atk", "base", atk.level * atkLevelMult + atk.ascension * ascensionMult);
      this.add("def", "base", def.level * levelMult + def.ascension * ascensionMult);
      this.add("cRate_", "base", 5);
      this.add("cDmg_", "base", 50);
      this.add("er_", "base", 100);
      this.add("naAtkSpd_", "base", 100);
      this.add("caAtkSpd_", "base", 100);
    }

    // ===== Innate stats =====
    data.statInnates?.forEach((stat) => {
      this.add(stat.type, "base", stat.value);
    });

    // ===== Ascension stats =====
    {
      const { statBonus } = data;
      const ascensionStatMult = member.ascension > 2 ? member.ascension - 2 : 0;
      const ascensionStatValue = statBonus.value * ascensionStatMult;

      this.add(statBonus.type, "fiBonus", ascensionStatValue);
    }

    // ===== Weapon =====
    {
      const { subStat } = member.weapon.data;
      const { mainStatValue, subStatValue } = member.weapon;

      this.add("atk", "base", mainStatValue);

      if (subStatValue && subStat) {
        this.add(subStat.type, "fiBonus", subStatValue);
      }
    }

    // ===== Artifacts =====
    member.atfGear.attributes.forEach((stat, value) => {
      const validStat: AttributeStat = isBaseStat(stat) ? baseStatToCoreStat(stat) : stat;

      this.add(validStat, "fiBonus", value);
    });

    // ===== Resonances =====
    for (const elmt of resonanceElmts) {
      if (elmt in AUTO_RESONANCE_STATS) {
        const { key, value } = AUTO_RESONANCE_STATS[elmt];

        this.add(key, "fiBonus", value);
      }
    }

    return this.attrs;
  }

  get(stat: AttributeStat): InternalAttribute {
    const attr = this.attrs.get(stat);

    if (attr) {
      return attr;
    }

    const newAttr = genAttr();
    this.attrs.set(stat, newAttr);

    return newAttr;
  }

  getTotal(key: AttributeStat, fixedOnly = false) {
    const { base, fiBonus, dyBonus } = this.get(key);
    let total = base + fiBonus;

    if (!fixedOnly) {
      total += dyBonus;
    }

    if (isCoreStat(key)) {
      const percent = this.get(`${key}_`);
      let totalPercent = percent.base + percent.fiBonus;

      if (!fixedOnly) {
        totalPercent += percent.dyBonus;
      }

      total += (base * totalPercent) / 100;
    }

    return total;
  }

  add(stat: AttributeStat, key: AddableAttributeKey, value: number) {
    this.get(stat)[key] += value;
  }

  finalize() {
    const finals: AllAttributes = new TypeCounter(undefined, {
      allowNegative: true,
    });

    for (const [stat, attr] of this.attrs) {
      let final = attr.base + attr.fiBonus + attr.dyBonus;

      if (isCoreStat(stat)) {
        const percentAttr = this.get(`${stat}_`);
        const percent = percentAttr.base + percentAttr.fiBonus + percentAttr.dyBonus;

        final += (attr.base * percent) / 100;
        finals.add(`base_${stat}`, attr.base);
      }

      finals.add(stat, final);
    }

    this.finals = finals;

    return finals;
  }

  clone() {
    const clonedAttrs: InternalAttributes = new Map();

    for (const [stat, attr] of this.attrs) {
      clonedAttrs.set(stat, { ...attr });
    }

    return new AttributeControl({
      attrs: clonedAttrs,
      finals: this.finals.clone(),
    });
  }
}

function genAttr(): InternalAttribute {
  return {
    base: 0,
    fiBonus: 0,
    dyBonus: 0,
  };
}
