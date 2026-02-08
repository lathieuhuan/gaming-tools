import type { AllAttributes, AttributeBonus, AttributeStat, CoreStat } from "@/types";
import type { CharacterCalc } from "./CharacterCalc";

import { ATTRIBUTE_STAT_TYPES } from "@/constants/global";
import Object_ from "@/utils/Object";
import TypeCounter, { TypeCounterKey } from "@/utils/TypeCounter";
import { round } from "@/utils/pure-utils";

const ASC_MULT_BY_ASC = [0, 38 / 182, 65 / 182, 101 / 182, 128 / 182, 155 / 182, 1];

type ResonanceStat = {
  key: AttributeStat;
  value: number;
};

const AUTO_RESONANCE_STATS: Record<string, ResonanceStat> = {
  pyro: { key: "atk_", value: 25 },
  geo: { key: "shieldS_", value: 15 },
  hydro: { key: "hp_", value: 25 },
  dendro: { key: "em", value: 50 },
};

export type AllAttributesControlOptions = {
  shouldLog?: boolean;
};

export type AttributeControlLog = {
  label: string;
  value: number;
};

type InternalAttribute = {
  base: number;
  fixedBonus: number;
  dynamicBonus: number;
  logs?: AttributeControlLog[];
};

type InternalAllAttributes = Record<AttributeStat, InternalAttribute>;

export class AllAttributesControl {
  private allAttrs: InternalAllAttributes;
  readonly shouldLog?: boolean;

  constructor(
    initial: Partial<InternalAllAttributes> = {},
    options: AllAttributesControlOptions = {}
  ) {
    const { shouldLog = false } = options;

    this.allAttrs = initial as InternalAllAttributes;
    this.shouldLog = shouldLog;
  }

  init(character: CharacterCalc) {
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
    character.atfGear.finalizeAttributes({
      hp_base: this.getBase("hp"),
      atk_base: this.getBase("atk"),
      def_base: this.getBase("def"),
    });

    character.atfGear.finalAttrs.entries.forEach(([stat, value]) => {
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
  }

  // ===== GET & SET =====

  private _get(stat: AttributeStat): InternalAttribute {
    if (this.allAttrs[stat]) {
      return this.allAttrs[stat];
    }

    return {
      base: 0,
      fixedBonus: 0,
      dynamicBonus: 0,
    };
  }

  private _set<T extends keyof InternalAttribute>(
    stat: AttributeStat,
    key: T,
    valueOrSetter: InternalAttribute[T] | ((attr: InternalAttribute[T]) => InternalAttribute[T])
  ) {
    const attr = this._get(stat);

    attr[key] = typeof valueOrSetter === "function" ? valueOrSetter(attr[key]) : valueOrSetter;
    this.allAttrs[stat] = attr;
  }

  // ===== LOG =====

  getLogs(key: AttributeStat) {
    return this._get(key).logs || [];
  }

  private log(key: AttributeStat, value: number, label: string) {
    if (this.shouldLog) {
      this._set(key, "logs", (logs) => {
        logs?.push({ label, value });
        return logs;
      });
    }
  }

  // ===== BASE =====

  addBase(key: AttributeStat, value: number, label = "Character base stat") {
    this._set(key, "base", (base) => base + value);
    this.log(key, value, label);
  }

  getBase(key: AttributeStat) {
    return this._get(key).base;
  }

  // ===== BONUS & TOTAL =====

  applyBonus(bonus: AttributeBonus) {
    if (bonus.toStat === "base_atk" || bonus.toStat === "base_hp" || bonus.toStat === "base_def") {
      const statType = bonus.toStat.slice(5) as CoreStat;
      this.addBase(statType, bonus.value, bonus.label);
      return;
    }

    const bonusType = bonus.isDynamic ? "dynamicBonus" : "fixedBonus";

    this._set(bonus.toStat, bonusType, (prev) => prev + bonus.value);
    this.log(bonus.toStat, bonus.value, bonus.label);
  }

  getTotal(key: AttributeStat | "base_atk", fixedOnly = false) {
    if (key === "base_atk") {
      return this.getBase("atk");
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
    const allAttrs = new TypeCounter<TypeCounterKey<AllAttributes>>(undefined, {
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

    return allAttrs;
  }

  clone() {
    return new AllAttributesControl(Object_.cloneProps(this.allAttrs), {
      shouldLog: this.shouldLog,
    });
  }

  clear() {
    this.allAttrs = {} as InternalAllAttributes;
    return this;
  }
}

function isCoreStat(key: string) {
  return key === "hp" || key === "atk" || key === "def";
}
