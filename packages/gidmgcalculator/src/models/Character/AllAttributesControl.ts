import { Object_, round } from "ron-utils";

import type { AllAttributes, AttributeBonus, AttributeStat, BaseAttributeStat } from "@/types";
import type { Character } from "./Character";

import { ATTRIBUTE_STAT_TYPES } from "@/constants";
import { baseStatToCoreStat, isBaseStat, isCoreStat } from "@/logic/stat.logic";
import TypeCounter from "@/utils/TypeCounter";

const ASC_MULT_BY_ASC = [0, 38 / 182, 65 / 182, 101 / 182, 128 / 182, 155 / 182, 1];

const AUTO_RESONANCE_STATS: Record<string, { key: AttributeStat; value: number }> = {
  pyro: { key: "atk_", value: 25 },
  geo: { key: "shieldS_", value: 15 },
  hydro: { key: "hp_", value: 25 },
  dendro: { key: "em", value: 50 },
};

type AllAttributesControlInitial = {
  details?: DetailedAttributes;
  finals?: AllAttributes;
};

type AttributeControlLog = {
  label: string;
  value: number;
};

type InternalAttribute = {
  base: number;
  fixedBonus: number;
  dynamicBonus: number;
  logs: AttributeControlLog[];
};

type DetailedAttributes = Record<AttributeStat, InternalAttribute>;

export class AllAttributesControl {
  private details: DetailedAttributes;
  public finals: AllAttributes;

  /** Deep clone initial if it is reused */
  constructor(initial: AllAttributesControlInitial = {}) {
    const { details = {}, finals = new TypeCounter() } = initial;

    this.details = details as DetailedAttributes;
    this.finals = finals;
  }

  init(character: Character) {
    const { data } = character;

    this.clear();

    // ===== Base stats =====
    {
      const { hp, atk, def } = data.statBases;
      const use4starMult = character.isTraveler || data.rarity === 4;

      let levelMult = (100 + 9 * character.bareLv) / 109;
      levelMult = use4starMult ? levelMult : (levelMult * (1900 + character.bareLv)) / 1901;
      levelMult = round(levelMult, 3);

      let atkLevelMult = levelMult;

      if (character.bareLv > 90) {
        if (character.bareLv === 95) {
          atkLevelMult = use4starMult ? 9.87 : 10.184;
        } else {
          atkLevelMult = use4starMult ? 11.392 : 11.629;
        }
      }

      const ascensionMult = ASC_MULT_BY_ASC[character.ascension];

      this.addBase("hp", hp.level * levelMult + hp.ascension * ascensionMult);
      this.addBase("atk", atk.level * atkLevelMult + atk.ascension * ascensionMult);
      this.addBase("def", def.level * levelMult + def.ascension * ascensionMult);
      this.addBase("cRate_", 5);
      this.addBase("cDmg_", 50);
      this.addBase("er_", 100);
      this.addBase("naAtkSpd_", 100);
      this.addBase("caAtkSpd_", 100);
    }

    // ===== Innate stats =====
    data.statInnates?.forEach((stat) => {
      this.addBase(stat.type, stat.value, "Character innate stat");
    });

    // ===== Ascension stats =====
    {
      const { statBonus } = data;
      const ascensionStatMult = character.ascension > 2 ? character.ascension - 2 : 0;
      const ascensionStatValue = statBonus.value * ascensionStatMult;

      this.addBase(statBonus.type, ascensionStatValue, "Character ascension stat");
    }

    // ===== Weapon =====
    {
      const { subStat } = character.weapon.data;
      const { mainStatValue, subStatValue } = character.weapon;

      this.addBase("atk", mainStatValue, "Weapon main stat");

      if (subStatValue && subStat) {
        this.applyBonus({
          value: subStatValue,
          toStat: subStat.type,
          label: `Weapon sub-stat`,
        });
      }
    }

    // ===== Artifacts =====
    character.atfGear
      .finalizeAttributes({
        hp_base: this.getBase("hp"),
        atk_base: this.getBase("atk"),
        def_base: this.getBase("def"),
      })
      .entries.forEach(([stat, value]) => {
        this.applyBonus({
          toStat: stat,
          value,
          label: "Artifact stat",
        });
      });

    // ===== Resonances =====
    for (const resonance of character.team.resonances) {
      if (resonance in AUTO_RESONANCE_STATS) {
        const { key, value } = AUTO_RESONANCE_STATS[resonance];

        this.applyBonus({
          toStat: key,
          value,
          label: `${resonance} resonance`,
        });
      }
    }

    return this.details;
  }

  // ===== GET & SET =====

  private _get(stat: AttributeStat): InternalAttribute {
    if (this.details[stat]) {
      return this.details[stat];
    }

    return {
      base: 0,
      fixedBonus: 0,
      dynamicBonus: 0,
      logs: [],
    };
  }

  private _set<T extends keyof InternalAttribute>(
    stat: AttributeStat,
    key: T,
    valueOrSetter: InternalAttribute[T] | ((attr: InternalAttribute[T]) => InternalAttribute[T])
  ) {
    const attr = this._get(stat);

    attr[key] = typeof valueOrSetter === "function" ? valueOrSetter(attr[key]) : valueOrSetter;
    this.details[stat] = attr;
  }

  // ===== LOG =====

  getLogs(key: AttributeStat) {
    return this._get(key).logs || [];
  }

  private addLog(key: AttributeStat, value: number, label: string) {
    this._set(key, "logs", (logs) => {
      logs.push({ label, value });
      return logs;
    });
  }

  // ===== UPDATE =====

  addBase(key: AttributeStat, value: number, label = "Character base stat") {
    this._set(key, "base", (base) => base + value);
    this.addLog(key, value, label);
  }

  applyBonus(bonus: AttributeBonus) {
    if (isBaseStat(bonus.toStat)) {
      const statType = baseStatToCoreStat(bonus.toStat);
      this.addBase(statType, bonus.value, bonus.label);
      return;
    }

    const bonusType = bonus.isDynamic ? "dynamicBonus" : "fixedBonus";

    this._set(bonus.toStat, bonusType, (prev) => prev + bonus.value);
    this.addLog(bonus.toStat, bonus.value, bonus.label);
  }

  // ===== READ =====

  getBase(key: AttributeStat) {
    return this._get(key).base;
  }

  getTotal(key: AttributeStat | BaseAttributeStat, fixedOnly = false) {
    if (isBaseStat(key)) {
      return this.getBase(baseStatToCoreStat(key));
    }

    const { base, fixedBonus, dynamicBonus } = this._get(key);
    let total = base + fixedBonus;

    if (!fixedOnly) {
      total += dynamicBonus;
    }

    if (isCoreStat(key)) {
      const percent = this._get(`${key}_`);
      let totalPercent = percent.base + percent.fixedBonus;

      if (!fixedOnly) {
        totalPercent += percent.dynamicBonus;
      }

      total += (base * totalPercent) / 100;
    }

    return total;
  }

  // ===== FINALS =====

  finalize() {
    const allAttrs: AllAttributes = new TypeCounter(undefined, {
      allowNegative: true,
    });

    for (const key of ATTRIBUTE_STAT_TYPES) {
      if (key === "hp_" || key === "atk_" || key === "def_") {
        continue;
      }

      if (isCoreStat(key)) {
        allAttrs.add(`base_${key}`, this._get(key).base);
      }

      const total = this.getTotal(key);
      const isSpeedStat = key === "naAtkSpd_" || key === "caAtkSpd_";

      allAttrs.add(key, isSpeedStat ? Math.min(total, 160) : total);
    }

    this.finals = allAttrs;

    return allAttrs;
  }

  clone() {
    return new AllAttributesControl({
      details: Object_.clone(this.details),
      finals: this.finals.clone(),
    });
  }

  clear() {
    this.details = {} as DetailedAttributes;
    this.finals = new TypeCounter();
    return this;
  }
}
