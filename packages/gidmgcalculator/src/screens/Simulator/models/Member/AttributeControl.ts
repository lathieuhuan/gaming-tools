import { round } from "ron-utils";

import type { AllAttributes, AllAttributeStat, AttributeStat } from "@/types";
import type { Member } from "./Member";

import { baseStatToCoreStat, isBaseStat, isCoreStat } from "@/logic/stat.logic";
import TypeCounter from "@/utils/TypeCounter";

const ASC_MULT_BY_ASC = [0, 38 / 182, 65 / 182, 101 / 182, 128 / 182, 155 / 182, 1];

type AttributeLog = {
  stat: AllAttributeStat;
  value: number;
  label: string;
};

export class AttributeControl {
  private attrs: AllAttributes;
  private logs: AttributeLog[] = [];

  finals: AllAttributes;

  constructor() {
    this.attrs = new TypeCounter({}, { allowNegative: true });
    this.finals = new TypeCounter({}, { allowNegative: true });
  }

  private _add(stat: AllAttributeStat, value: number, label = "Character base stat") {
    this.attrs.add(stat, value);
    this.logs.push({ stat, value, label });
  }

  init(member: Member) {
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

      this._add("base_hp", hp.level * levelMult + hp.ascension * ascensionMult);
      this._add("base_atk", atk.level * atkLevelMult + atk.ascension * ascensionMult);
      this._add("base_def", def.level * levelMult + def.ascension * ascensionMult);
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

      this._add("base_atk", mainStatValue, "Weapon main stat");

      if (subStatValue && subStat) {
        this._add(subStat.type, subStatValue, "Weapon sub stat");
      }
    }

    // ===== Artifacts =====
    member.atfGear.attributes.forEach((stat, value) => {
      const validStat: AttributeStat = isBaseStat(stat) ? baseStatToCoreStat(stat) : stat;

      this._add(validStat, value, "Artifact stat");
    });

    return this.attrs;
  }

  /** For getting stat value before finalize */
  get(stat: AttributeStat) {
    const value = this.attrs.get(stat);

    if (isCoreStat(stat)) {
      const base = this.attrs.get(`base_${stat}`);
      const percent = this.attrs.get(`${stat}_`);

      return base + (base * percent) / 100 + value;
    }

    return value;
  }

  getCopy() {
    return this.attrs.clone();
  }
}
