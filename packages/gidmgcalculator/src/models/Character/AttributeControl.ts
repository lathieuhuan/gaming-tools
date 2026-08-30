import { CountMap, round } from "ron-utils";

import type { AllAttributes, AttributeBonus, AttributeStat, BaseAttributeStat } from "@/types";
import type { Character } from "./Character";

import { ATTRIBUTE_STAT_TYPES } from "@/constants";
import { baseStatToCoreStat, isBaseStat, isCoreStat } from "@/logic/stat.logic";

const ASC_MULT_BY_ASC = [0, 38 / 182, 65 / 182, 101 / 182, 128 / 182, 155 / 182, 1];

const AUTO_RESONANCE_STATS: Record<string, { key: AttributeStat; value: number }> = {
  pyro: { key: "atk_", value: 25 },
  geo: { key: "shieldS_", value: 15 },
  hydro: { key: "hp_", value: 25 },
  dendro: { key: "em", value: 50 },
};

type AttributeControlCloneOptions = {
  details?: InternalAttributes;
  finals?: AllAttributes;
};

type AttributeControlLog = {
  label: string;
  value: number;
};

type InternalAttributeElement = "base" | "static" | "dynamic";

type InternalAttribute = Record<InternalAttributeElement, number> & {
  logs: AttributeControlLog[];
};

type InternalAttributes = Map<AttributeStat, InternalAttribute>;

export class AttributeControl {
  private constructor(
    private attrs: InternalAttributes,
    public finals: AllAttributes,
  ) {}

  static create() {
    return new AttributeControl(new Map(), new CountMap([], { min: -Infinity }));
  }

  base(key: AttributeStat) {
    return this._get(key).base;
  }

  total(key: AttributeStat | BaseAttributeStat, staticOnly = false) {
    if (isBaseStat(key)) {
      return this.base(baseStatToCoreStat(key));
    }

    const attr = this._get(key);
    let total = attr.base + attr.static;

    if (!staticOnly) {
      total += attr.dynamic;
    }

    if (isCoreStat(key)) {
      const percent = this._get(`${key}_`);
      let totalPercent = percent.base + percent.static;

      if (!staticOnly) {
        totalPercent += percent.dynamic;
      }

      total += (attr.base * totalPercent) / 100;
    }

    return total;
  }

  private addBase(key: AttributeStat, value: number, label = "Character base stat") {
    this._add(key, "base", value, label);
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
        this.addBonus({
          value: subStatValue,
          toStat: subStat.type,
          label: `Weapon sub-stat`,
        });
      }
    }

    // ===== Artifacts =====
    {
      const attributes = character.atfGear.finalizeAttributes({
        hp_base: this.base("hp"),
        atk_base: this.base("atk"),
        def_base: this.base("def"),
      });

      for (const [stat, value] of attributes.entries()) {
        this.addBonus({
          toStat: stat,
          value,
          label: "Artifact stat",
        });
      }
    }

    // ===== Resonances =====
    for (const resonance of character.team.resonances) {
      if (resonance in AUTO_RESONANCE_STATS) {
        const { key, value } = AUTO_RESONANCE_STATS[resonance];

        this.addBonus({
          toStat: key,
          value,
          label: `${resonance} resonance`,
        });
      }
    }

    return this.attrs;
  }

  private _get(stat: AttributeStat): InternalAttribute {
    const attr = this.attrs.get(stat);

    if (attr !== undefined) {
      return attr;
    }

    return {
      base: 0,
      static: 0,
      dynamic: 0,
      logs: [],
    };
  }

  private _add(stat: AttributeStat, el: InternalAttributeElement, value: number, label: string) {
    const attr = this._get(stat);

    attr[el] += value;
    attr.logs.push({ label, value });

    this.attrs.set(stat, attr);
  }

  logsOf(key: AttributeStat) {
    return this._get(key).logs;
  }

  addBonus(bonus: AttributeBonus) {
    const attrEl: InternalAttributeElement = bonus.isDynamic ? "dynamic" : "static";

    if (isBaseStat(bonus.toStat)) {
      // TODO remove `BaseAttributeStat` from `AttributeBonus.toStat` and especially handle it.
      // Only Mavuika has this mechanism.
      return;
    }

    this._add(bonus.toStat, attrEl, bonus.value, bonus.label);
  }

  finalize() {
    const allAttrs: AllAttributes = new CountMap([], { min: -Infinity });

    for (const key of ATTRIBUTE_STAT_TYPES) {
      if (key === "hp_" || key === "atk_" || key === "def_") {
        continue;
      }

      if (isCoreStat(key)) {
        allAttrs.add(`base_${key}`, this._get(key).base);
      }

      const total = this.total(key);
      const isSpeedStat = key === "naAtkSpd_" || key === "caAtkSpd_";

      allAttrs.add(key, isSpeedStat ? Math.min(total, 160) : total);
    }

    this.finals = allAttrs;

    return allAttrs;
  }

  clone(initial: AttributeControlCloneOptions = {}) {
    const { details = this.attrs, finals = this.finals } = initial;

    return new AttributeControl(details, finals);
  }

  clear() {
    this.attrs = new Map();
    this.finals = new CountMap([], { min: -Infinity });
    return this;
  }
}
