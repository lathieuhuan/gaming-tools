import { round } from "rond";

import { AppCharacter, Level } from "@/calculation/types";
import { GeneralCalc } from "@/calculation/utils";
import Array_ from "@/utils/Array";
import { ArtifactC } from "./Artifact";
import { ArtifactGear } from "./ArtifactGear";
import { TotalAttributeControl } from "./TotalAttributeControl";
import { WeaponC } from "./Weapon";
import { AttributeControl } from "./AttributeControl";
import { TrackerC } from "./Tracker";

export interface ICharacter {
  name: string;
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
  enhanced: boolean;
}

export type ICharacterArtifacts = (ArtifactC | null)[];

export interface ICharacterGear {
  weapon: WeaponC;
  artifacts?: ICharacterArtifacts;
}

const ASC_MULT_BY_ASC = [0, 38 / 182, 65 / 182, 101 / 182, 128 / 182, 155 / 182, 1];

export class CharacterC implements ICharacter {
  name: string;
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
  enhanced: boolean;

  weapon: WeaponC;
  artifact: ArtifactGear;

  isTraveler: boolean;
  // isOnfield = false;
  bareLv: number;
  ascension: number;

  inntateStats = new AttributeControl();
  totalAttrCtrl = new TotalAttributeControl();

  constructor(info: ICharacter & ICharacterGear, public data: AppCharacter) {
    this.name = info.name;
    this.level = info.level;
    this.NAs = info.NAs;
    this.ES = info.ES;
    this.EB = info.EB;
    this.cons = info.cons;
    this.enhanced = info.enhanced;

    this.weapon = info.weapon;
    this.artifact = new ArtifactGear(Array_.truthify(info.artifacts));

    this.isTraveler = data.name.slice(-8) === "Traveler";
    this.bareLv = GeneralCalc.getBareLv(this.level);
    this.ascension = GeneralCalc.getAscension(this.level);

    data.statInnates?.forEach((stat) => {
      this.inntateStats.add(stat.type, stat.value);
    });

    // this.totalAttrCtrl.construct(this);
  }

  initTotalAttr = (tracker?: TrackerC) => {
    this.totalAttrCtrl.reset(tracker);

    // ===== Base stats =====
    {
      const { hp, atk, def } = this.data.statBases;
      const use4starMult = this.isTraveler || this.data.rarity === 4;

      let levelMult = (100 + 9 * this.bareLv) / 109;
      levelMult = use4starMult ? levelMult : (levelMult * (1900 + this.bareLv)) / 1901;
      levelMult = round(levelMult, 3);

      let atkLevelMult = levelMult;

      if (this.bareLv > 90) {
        if (this.bareLv === 95) {
          atkLevelMult = use4starMult ? 9.87 : 10.184;
        } else {
          atkLevelMult = use4starMult ? 11.392 : 11.629;
        }
      }

      const ascensionMult = ASC_MULT_BY_ASC[this.ascension];

      this.totalAttrCtrl.addBase("hp", hp.level * levelMult + hp.ascension * ascensionMult);
      this.totalAttrCtrl.addBase("atk", atk.level * atkLevelMult + atk.ascension * ascensionMult);
      this.totalAttrCtrl.addBase("def", def.level * levelMult + def.ascension * ascensionMult);
      this.totalAttrCtrl.addBase("cRate_", 5);
      this.totalAttrCtrl.addBase("cDmg_", 50);
      this.totalAttrCtrl.addBase("er_", 100);
      this.totalAttrCtrl.addBase("naAtkSpd_", 100);
      this.totalAttrCtrl.addBase("caAtkSpd_", 100);
    }

    // ===== Innate stats =====
    this.inntateStats.entries.forEach(([stat, value]) => {
      this.totalAttrCtrl.addBase(stat, value, "Character innate stat");
    });

    // ===== Ascension stats =====
    {
      const { statBonus } = this.data;
      const ascensionStatMult = this.ascension > 2 ? this.ascension - 2 : 0;
      const ascensionStatValue = statBonus.value * ascensionStatMult;

      this.totalAttrCtrl.addBase(statBonus.type, ascensionStatValue, "Character ascension stat");
    }

    // ===== Weapon =====
    {
      const { name, subStat } = this.weapon.data;
      const { mainStatValue, subStatValue } = this.weapon;

      this.totalAttrCtrl.addBase("atk", mainStatValue, "Weapon main stat");

      if (subStatValue && subStat) {
        this.totalAttrCtrl.applyBonuses({
          value: subStatValue,
          toStat: subStat.type,
          description: `${name} sub-stat`,
        });
      }
    }

    // ===== Artifacts =====
    this.artifact
      .finalizeAttributes({
        hp_base: this.totalAttrCtrl.getBase("hp"),
        atk_base: this.totalAttrCtrl.getBase("atk"),
        def_base: this.totalAttrCtrl.getBase("def"),
      })
      .entries.forEach(([stat, value]) => {
        this.totalAttrCtrl.applyBonuses({
          toStat: stat,
          value,
          description: "Artifact stat",
        });
      });
  };
}
