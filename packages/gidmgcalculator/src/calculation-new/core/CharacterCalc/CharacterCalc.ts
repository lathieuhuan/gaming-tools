import type {
  AppCharacter,
  AttackBonus,
  AttributeBonus,
  AttributeStat,
  BonusPerformTools,
  EntityBonus,
  EntityBonusEffect,
  EntityPenaltyEffect,
  ITeam,
} from "@/types";
import type { IEffectPerformer } from "../../types";

import { BonusCalc, CalcCharacter, ICalcCharacter, PenaltyCalc } from "@/models/base";
import { round } from "@/utils";
import { AUTO_RESONANCE_STAT } from "../../constants";
import { TotalAttributeControl } from "./TotalAttributeControl";

type BonusMonoRecord = {
  trackId: string;
  targetId: string;
};

export type ReceivedAttributeBonus = Omit<AttributeBonus, "toStat"> & {
  toStat: AttributeBonus["toStat"] | "OWN_ELMT";
  effectSrc: EntityBonus<EntityBonusEffect>;
};

export type ReceivedAttackBonus = AttackBonus & {
  effectSrc: EntityBonus<EntityBonusEffect>;
};

const ASC_MULT_BY_ASC = [0, 38 / 182, 65 / 182, 101 / 182, 128 / 182, 155 / 182, 1];

type CharacterCalcOptions = {
  shouldRecord?: boolean;
};

export class CharacterCalc extends CalcCharacter implements IEffectPerformer {
  totalAttrCtrl: TotalAttributeControl;

  constructor(
    info: ICalcCharacter,
    public data: AppCharacter,
    team: ITeam,
    options: CharacterCalcOptions = {}
  ) {
    super({ ...info, attkBonusCtrl: undefined, totalAttrs: undefined }, data, team);

    this.totalAttrCtrl = new TotalAttributeControl(options);
  }

  // ===== TOTAL ATTRIBUTES =====

  initTotalAttr() {
    const { totalAttrCtrl } = this;
    totalAttrCtrl.init();

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

      totalAttrCtrl.addBase("hp", hp.level * levelMult + hp.ascension * ascensionMult);
      totalAttrCtrl.addBase("atk", atk.level * atkLevelMult + atk.ascension * ascensionMult);
      totalAttrCtrl.addBase("def", def.level * levelMult + def.ascension * ascensionMult);
      totalAttrCtrl.addBase("cRate_", 5);
      totalAttrCtrl.addBase("cDmg_", 50);
      totalAttrCtrl.addBase("er_", 100);
      totalAttrCtrl.addBase("naAtkSpd_", 100);
      totalAttrCtrl.addBase("caAtkSpd_", 100);
    }

    // ===== Innate stats =====
    this.inntateStats.entries.forEach(([stat, value]) => {
      totalAttrCtrl.addBase(stat, value, "Character innate stat");
    });

    // ===== Ascension stats =====
    {
      const { statBonus } = this.data;
      const ascensionStatMult = this.ascension > 2 ? this.ascension - 2 : 0;
      const ascensionStatValue = statBonus.value * ascensionStatMult;

      totalAttrCtrl.addBase(statBonus.type, ascensionStatValue, "Character ascension stat");
    }

    // ===== Weapon =====
    {
      const { subStat } = this.weapon.data;
      const { mainStatValue, subStatValue } = this.weapon;

      totalAttrCtrl.addBase("atk", mainStatValue, "Weapon main stat");

      if (subStatValue && subStat) {
        totalAttrCtrl.applyBonus({
          value: subStatValue,
          toStat: subStat.type,
          label: `Weapon sub-stat`,
        });
      }
    }

    // ===== Artifacts =====
    this.atfGear.finalizeAttributes({
      hp_base: totalAttrCtrl.getBase("hp"),
      atk_base: totalAttrCtrl.getBase("atk"),
      def_base: totalAttrCtrl.getBase("def"),
    });

    this.atfGear.finalAttrs.entries.forEach(([stat, value]) => {
      totalAttrCtrl.applyBonus({
        toStat: stat,
        value,
        label: "Artifact stat",
      });
    });

    // ===== Resonances =====
    for (const resonance of this.team.resonances) {
      if (resonance in AUTO_RESONANCE_STAT) {
        const { key, value } = AUTO_RESONANCE_STAT[resonance];

        totalAttrCtrl.applyBonus({
          toStat: key,
          value,
          label: `${resonance} resonance`,
        });
      }
    }
  }

  override getTotalAttr(key: AttributeStat | "base_atk", fixedOnly = false) {
    return this.totalAttrCtrl.getTotal(key, fixedOnly);
  }

  // ===== PERFORM EFFECTS =====

  performBonus(config: EntityBonusEffect, support: Partial<BonusPerformTools>) {
    return new BonusCalc(this, this.team, support).makeBonus(config);
  }

  performPenalty(config: EntityPenaltyEffect, inputs?: number[]) {
    return new PenaltyCalc(this, this.team, inputs).makePenalty(config);
  }

  // ===== RECEIVE BONUSES =====

  private monoRecords: NonNullable<BonusMonoRecord>[] = [];

  private isRecordedBonus(trackId: string, targetId: string) {
    const recorded = this.monoRecords.some((savedRecord) => {
      return trackId === savedRecord.trackId && targetId === savedRecord.targetId;
    });

    if (recorded) {
      return true;
    }

    this.monoRecords.push({ trackId, targetId });

    return false;
  }

  receiveAttrBonus(bonus: ReceivedAttributeBonus) {
    if (this.canReceiveEffect(bonus.effectSrc)) {
      const { monoId } = bonus.effectSrc;
      const toStat = bonus.toStat === "OWN_ELMT" ? this.data.vision : bonus.toStat;
      const notRecorded = !monoId || !this.isRecordedBonus(monoId, toStat);

      if (notRecorded) {
        this.totalAttrCtrl.applyBonus({
          ...bonus,
          toStat,
        });

        return true;
      }
    }

    return false;
  }

  receiveAttkBonus(bonus: ReceivedAttackBonus) {
    if (this.canReceiveEffect(bonus.effectSrc)) {
      const { monoId } = bonus.effectSrc;
      const notRecorded =
        !monoId || !this.isRecordedBonus(monoId, `${bonus.toType}/${bonus.toKey}`);

      if (notRecorded) {
        this.attkBonusCtrl.add(bonus);

        return true;
      }
    }

    return false;
  }
}
