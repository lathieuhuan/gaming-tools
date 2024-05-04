import type { NormalAttack } from "@Src/backend/types";
import type { CalculationFinalResult } from "../calculation.types";
import type { DebuffInfoWrap, GetFinalResultArgs } from "./getFinalResult.types";

import { $AppCharacter, $AppData } from "@Src/services";
import { ATTACK_PATTERNS, TRANSFORMATIVE_REACTIONS } from "@Src/backend/constants";
import { TRANSFORMATIVE_REACTION_INFO } from "../calculation.constants";

import { findByIndex, toArray } from "@Src/utils";
import { CharacterCalc, EntityCalc, GeneralCalc } from "../utils";
import { applyPenalty } from "./getFinalResult.utils";
import { ResistanceReductionControl, TrackerControl } from "../controls";
import { CalcItemCalc } from "./calc-item-calc";
import applyAbilityDebuff from "./applyCharacterDebuff";

export default function getFinalResult({
  char,
  weapon,
  appChar,
  party,
  appWeapon,
  partyData,
  selfDebuffCtrls,
  artDebuffCtrls,
  customDebuffCtrls,
  disabledNAs,
  totalAttr,
  attPattBonus,
  attElmtBonus,
  rxnBonus,
  calcItemBuff,
  elmtModCtrls: { reaction, infuse_reaction, resonances, superconduct, absorption },
  infusion,
  target,
  tracker,
}: GetFinalResultArgs) {
  const resistReduct = new ResistanceReductionControl(tracker);

  const { multFactorConf, calcList, weaponType, vision, debuffs } = appChar;
  const infoWrap: DebuffInfoWrap = {
    char,
    appChar,
    partyData,
    resistReduct,
  };

  // APPLY CUSTOM DEBUFFS
  for (const control of customDebuffCtrls) {
    resistReduct.add(control.type, control.value, "Custom Debuff");
  }

  // APPLY SELF DEBUFFS
  for (const { activated, inputs = [], index } of selfDebuffCtrls) {
    const debuff = findByIndex(debuffs || [], index);

    if (activated && debuff?.effects && EntityCalc.isGrantedEffect(debuff, char)) {
      applyAbilityDebuff({
        description: `Self / ${debuff.src}`,
        effects: debuff.effects,
        inputs,
        infoWrap,
        fromSelf: true,
      });
    }
  }

  // APPLY PARTY DEBUFFS
  for (const teammate of party) {
    if (!teammate) continue;
    const { debuffs = [] } = $AppCharacter.get(teammate.name);

    for (const { activated, inputs = [], index } of teammate.debuffCtrls) {
      const debuff = findByIndex(debuffs, index);

      if (activated && debuff?.effects) {
        applyAbilityDebuff({
          description: `Self / ${debuff.src}`,
          effects: debuff.effects,
          inputs,
          infoWrap,
          fromSelf: false,
        });
      }
    }
  }

  // APPLY ARTIFACT DEBUFFS
  for (const { activated, code, index, inputs = [] } of artDebuffCtrls) {
    if (activated) {
      const { name, debuffs = [] } = $AppData.getArtifactSet(code) || {};
      const { effects } = debuffs[index] || {};

      if (effects) {
        applyPenalty({
          penaltyValue: effects.value,
          targets: effects.targets,
          info: infoWrap,
          inputs,
          description: `${name} / 4-piece activated`,
        });
      }
    }
  }

  // APPLY RESONANCE DEBUFFS
  const geoRsn = resonances.find((rsn) => rsn.vision === "geo");
  if (geoRsn && geoRsn.activated) {
    resistReduct.add("geo", 20, "Geo resonance");
  }
  if (superconduct) {
    resistReduct.add("phys", 40, "Superconduct");
  }
  const finalResistances = resistReduct.apply(target);

  const finalResult: CalculationFinalResult = {
    NAs: {},
    ES: {},
    EB: {},
    RXN: {},
    WP_CALC: {},
  };

  const calcItemCalc = new CalcItemCalc(
    char.level,
    target.level,
    totalAttr,
    attPattBonus,
    attElmtBonus,
    finalResistances
  );

  ATTACK_PATTERNS.forEach((ATT_PATT) => {
    const resultKey = ATT_PATT === "ES" || ATT_PATT === "EB" ? ATT_PATT : "NAs";
    const defaultInfo = CharacterCalc.getTalentDefaultInfo(resultKey, weaponType, vision, ATT_PATT, multFactorConf);
    const level = CharacterCalc.getFinalTalentLv({ appChar, talentType: resultKey, char, partyData });

    for (const stat of calcList[ATT_PATT]) {
      // DMG TYPES & AMPLIFYING REACTION MULTIPLIER
      const attPatt = stat.attPatt || defaultInfo.attPatt;
      let attElmt =
        (stat.subAttPatt === "FCA" ? vision : stat.attElmt === "absorb" ? absorption : stat.attElmt) ??
        defaultInfo.attElmt;
      let actualReaction = reaction;
      let rxnMult = 1;

      // check and infused
      if (
        resultKey === "NAs" &&
        attElmt === "phys" &&
        infusion.element !== "phys" &&
        infusion.range.includes(ATT_PATT as NormalAttack)
      ) {
        attElmt = infusion.element;

        if (infusion.isCustom) {
          actualReaction = infuse_reaction;
        }
      }

      // deal elemental dmg and want amplify reaction
      if (attElmt !== "phys" && (actualReaction === "melt" || actualReaction === "vaporize")) {
        rxnMult = GeneralCalc.getAmplifyingMultiplier(attElmt, rxnBonus)[actualReaction];
      }

      let bases = [];
      const { type = "attack", flatFactor } = stat;
      const [bonusList, itemBonus] = calcItemBuff.get(stat.id);

      const record = TrackerControl.initCalcItemRecord({
        itemType: type,
        multFactors: [],
        normalMult: 1,
        exclusives: bonusList,
      });

      // CALCULATE BASE DAMAGE
      for (const factor of toArray(stat.multFactors)) {
        const {
          root,
          scale = defaultInfo.scale,
          basedOn = defaultInfo.basedOn,
        } = typeof factor === "number" ? { root: factor } : factor;

        const finalMult =
          root * CharacterCalc.getTalentMult(scale, level) + (itemBonus.mult_ ?? 0) + attPattBonus[ATT_PATT].mult_;

        let flatBonus = 0;

        if (flatFactor) {
          const { root, scale = defaultInfo.flatFactorScale } =
            typeof flatFactor === "number" ? { root: flatFactor } : flatFactor;

          flatBonus = root * CharacterCalc.getTalentMult(scale, level);
        }

        record.multFactors.push({
          value: totalAttr[basedOn],
          desc: basedOn,
          talentMult: finalMult,
        });
        record.totalFlat = flatBonus;

        bases.push((totalAttr[basedOn] * finalMult) / 100 + flatBonus);
      }

      if (stat.joinMultFactors) {
        bases = [bases.reduce((accumulator, base) => accumulator + base, 0)];
      }

      // TALENT DMG
      if (resultKey === "NAs" && disabledNAs && !stat.type) {
        finalResult[resultKey][stat.name] = {
          nonCrit: 0,
          crit: 0,
          average: 0,
        };
      } else {
        finalResult[resultKey][stat.name] = calcItemCalc.calculate({
          base: bases.length > 1 ? bases : bases[0],
          attPatt,
          attElmt,
          calcType: stat.type,
          rxnMult,
          calcItemBonus: itemBonus,
          record,
        });
      }

      tracker?.recordCalcItem(resultKey, stat.name, record);
    }
  });

  const baseRxnDmg = GeneralCalc.getBaseRxnDmg(char.level);

  for (const rxn of TRANSFORMATIVE_REACTIONS) {
    const { mult, dmgType } = TRANSFORMATIVE_REACTION_INFO[rxn];
    const normalMult = 1 + rxnBonus[rxn].pct_ / 100;
    const resMult = dmgType !== "absorb" ? finalResistances[dmgType] : 1;
    const baseValue = baseRxnDmg * mult;
    const nonCrit = baseValue * normalMult * resMult;
    const cDmg_ = rxnBonus[rxn].cDmg_ / 100;
    const cRate_ = Math.max(rxnBonus[rxn].cRate_, 0) / 100;

    finalResult.RXN[rxn] = {
      nonCrit,
      crit: cDmg_ ? nonCrit * (1 + cDmg_) : 0,
      average: cRate_ ? nonCrit * (1 + cDmg_ * cRate_) : nonCrit,
      attElmt: dmgType,
    };

    tracker?.recordCalcItem("RXN", rxn, {
      itemType: "attack",
      multFactors: [{ value: Math.round(baseValue), desc: "Base DMG" }],
      normalMult,
      resMult,
      cDmg_,
      cRate_,
    });
  }

  appWeapon.calcItems?.forEach((calcItem) => {
    const { name, type = "attack", value, incre = value / 3, baseOn = "atk" } = calcItem;
    const mult = value + incre * weapon.refi;
    const record = TrackerControl.initCalcItemRecord({
      itemType: type,
      multFactors: [
        {
          value: totalAttr[baseOn],
          desc: baseOn,
          talentMult: mult,
        },
      ],
      normalMult: 1,
    });

    finalResult.WP_CALC[name] = calcItemCalc.calculate({
      calcType: calcItem.type,
      attElmt: "phys",
      attPatt: "none",
      base: (totalAttr[baseOn] * mult) / 100,
      record,
      rxnMult: 1,
    });

    tracker?.recordCalcItem("WP_CALC", name, record);
  });

  return finalResult;
}
