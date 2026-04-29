import { Object_, round } from "ron-utils";

import type { AllAttributes, AttributeStat, AutoRsnElmtType } from "@/types";
import type { Member } from "./Member";
import type { AttributeBonusRecord } from "./types";

import { CORE_STAT_TYPES } from "@/constants";
import { baseStatToCoreStat, isBaseStat, isCoreStat } from "@/logic/stat.logic";
import TypeCounter from "@/utils/TypeCounter";

const ASC_MULT_BY_ASC = [0, 38 / 182, 65 / 182, 101 / 182, 128 / 182, 155 / 182, 1];

const AUTO_RESONANCE_STATS: Record<string, { key: AttributeStat; value: number }> = {
  pyro: { key: "atk_", value: 25 },
  geo: { key: "shieldS_", value: 15 },
  hydro: { key: "hp_", value: 25 },
  dendro: { key: "em", value: 50 },
};

type AttributeLog = {
  stat: AttributeStat;
  value: number;
  label: string;
};

type AttributeControlConstructOptions = {
  attrs?: AllAttributes;
  finals?: AllAttributes;
};

export class AttributeControl {
  private attrs: AllAttributes;
  private logs: AttributeLog[] = [];

  finals: AllAttributes;

  constructor(options: AttributeControlConstructOptions = {}) {
    const {
      attrs = new TypeCounter({}, { allowNegative: true }),
      finals = new TypeCounter({}, { allowNegative: true }),
    } = options;

    this.attrs = attrs;
    this.finals = finals;
  }

  private _add(stat: AttributeStat, value: number, label = "Character base stat") {
    this.attrs.add(stat, value);
    this.logs.push({ stat, value, label });
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

      this._add("hp", hp.level * levelMult + hp.ascension * ascensionMult);
      this._add("atk", atk.level * atkLevelMult + atk.ascension * ascensionMult);
      this._add("def", def.level * levelMult + def.ascension * ascensionMult);
      this._add("cRate_", 5);
      this._add("cDmg_", 50);
      this._add("er_", 100);
      this._add("naAtkSpd_", 100);
      this._add("caAtkSpd_", 100);
    }

    // ===== Innate stats =====
    data.statInnates?.forEach((stat) => {
      this._add(stat.type, stat.value, "Character innate stat");
    });

    // ===== Ascension stats =====
    {
      const { statBonus } = data;
      const ascensionStatMult = member.ascension > 2 ? member.ascension - 2 : 0;
      const ascensionStatValue = statBonus.value * ascensionStatMult;

      this._add(statBonus.type, ascensionStatValue, "Character ascension stat");
    }

    // ===== Weapon =====
    {
      const { subStat } = member.weapon.data;
      const { mainStatValue, subStatValue } = member.weapon;

      this._add("atk", mainStatValue, "Weapon main stat");

      if (subStatValue && subStat) {
        this._add(subStat.type, subStatValue, "Weapon sub stat");
      }
    }

    // ===== Artifacts =====
    member.atfGear.attributes.forEach((stat, value) => {
      const validStat: AttributeStat = isBaseStat(stat) ? baseStatToCoreStat(stat) : stat;

      this._add(validStat, value, "Artifact stat");
    });

    // ===== Resonances =====
    for (const elmt of resonanceElmts) {
      if (elmt in AUTO_RESONANCE_STATS) {
        const { key, value } = AUTO_RESONANCE_STATS[elmt];

        this._add(key, value, "Resonance bonus");
      }
    }

    return this.attrs;
  }

  /** For getting stat value before finalize */
  get(stat: AttributeStat) {
    const base = this.attrs.get(stat);

    if (isCoreStat(stat)) {
      const percent = this.attrs.get(`${stat}_`);
      return base + (base * percent) / 100;
    }

    return base;
  }

  finalize(bonusRecord: AttributeBonusRecord = {}) {
    const finals: AllAttributes = this.attrs.clone();

    for (const [stat, bonuses] of Object_.entries(bonusRecord)) {
      if (!bonuses?.length) continue;

      for (const bonus of bonuses) {
        finals.add(stat, bonus.value);
      }
    }

    for (const stat of CORE_STAT_TYPES) {
      const base = finals.get(stat);
      const percent = finals.get(`${stat}_`);

      finals.add(`base_${stat}`, base);
      finals.add(stat, (base * percent) / 100);
    }

    this.finals = finals;

    return finals;
  }
}
