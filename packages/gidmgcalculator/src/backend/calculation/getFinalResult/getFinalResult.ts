import type { CalculationFinalResult } from "../calculation.types";
import type { DebuffInfoWrap, GetFinalResultArgs } from "./getFinalResult.types";

import { $AppCharacter, $AppData } from "@Src/services";
import { ATTACK_PATTERNS, TRANSFORMATIVE_REACTIONS } from "@Src/backend/constants";
import { TRANSFORMATIVE_REACTION_INFO } from "../calculation.constants";

import { findByIndex, toArray } from "@Src/utils";
import { CharacterCalc, EntityCalc, GeneralCalc } from "../utils";
import { ResistanceReductionControl, TrackerControl } from "../controls";
import { applyPenalty } from "./getFinalResult.utils";
import { CalcItemCalc } from "./calc-item-calc";
import ApplierCharacterDebuff from "./applier-character-debuff";
import AttackPatternConfig from "./attack-pattern-config";

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
  elmtModCtrls,
  infusion,
  calcListConfig,
  target,
  tracker,
}: GetFinalResultArgs) {
  const resistReduct = new ResistanceReductionControl(tracker);

  const infoWrap: DebuffInfoWrap = {
    char,
    appChar,
    partyData,
    resistReduct,
  };
  const characterDebuff = new ApplierCharacterDebuff(infoWrap);

  // APPLY CUSTOM DEBUFFS
  for (const control of customDebuffCtrls) {
    resistReduct.add(control.type, control.value, "Custom Debuff");
  }

  // APPLY SELF DEBUFFS
  for (const ctrl of selfDebuffCtrls) {
    const debuff = findByIndex(appChar.debuffs || [], ctrl.index);

    if (ctrl.activated && debuff?.effects && EntityCalc.isGrantedEffect(debuff, char)) {
      characterDebuff.apply({
        description: `Self / ${debuff.src}`,
        effects: debuff.effects,
        inputs: ctrl.inputs ?? [],
        fromSelf: true,
      });
    }
  }

  // APPLY PARTY DEBUFFS
  for (const teammate of party) {
    if (!teammate) continue;
    const { debuffs = [] } = $AppCharacter.get(teammate.name);

    for (const ctrl of teammate.debuffCtrls) {
      const debuff = findByIndex(debuffs, ctrl.index);

      if (ctrl.activated && debuff?.effects) {
        characterDebuff.apply({
          description: `Self / ${debuff.src}`,
          effects: debuff.effects,
          inputs: ctrl.inputs ?? [],
          fromSelf: false,
        });
      }
    }
  }

  // APPLY ARTIFACT DEBUFFS
  for (const ctrl of artDebuffCtrls) {
    if (ctrl.activated) {
      const { name, debuffs = [] } = $AppData.getArtifactSet(ctrl.code) || {};
      const { effects } = debuffs[ctrl.index] || {};

      if (effects) {
        applyPenalty({
          penaltyValue: effects.value,
          targets: effects.targets,
          info: infoWrap,
          inputs: ctrl.inputs ?? [],
          description: `${name} / 4-piece activated`,
        });
      }
    }
  }

  // APPLY RESONANCE DEBUFFS
  const geoRsn = elmtModCtrls.resonances.find((rsn) => rsn.vision === "geo");
  if (geoRsn && geoRsn.activated) {
    resistReduct.add("geo", 20, "Geo resonance");
  }
  if (elmtModCtrls.superconduct) {
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

  const attackPatternConfig = new AttackPatternConfig(appChar, elmtModCtrls, infusion);

  const calcItemCalc = new CalcItemCalc(
    char.level,
    target.level,
    totalAttr,
    attPattBonus,
    attElmtBonus,
    finalResistances
  );

  ATTACK_PATTERNS.forEach((ATT_PATT) => {
    const { resultKey, configCalcItem, configFlatFactor } = attackPatternConfig.config(ATT_PATT, calcListConfig);
    const level = CharacterCalc.getFinalTalentLv({ appChar, talentType: resultKey, char, partyData });

    for (const calcItem of appChar.calcList[ATT_PATT]) {
      const { attPatt, attElmt, reaction, configMultFactor } = configCalcItem(calcItem);
      let rxnMult = 1;

      console.log("====================");
      console.log("calcItem", calcItem.name);
      console.log(attPatt, attElmt, reaction);

      // deal elemental dmg and want amplify reaction
      if (attElmt !== "phys" && (reaction === "melt" || reaction === "vaporize")) {
        rxnMult = GeneralCalc.getAmplifyingMultiplier(attElmt, rxnBonus)[reaction];
      }

      let bases: number[] = [];
      const { type = "attack" } = calcItem;
      const [bonusList, itemBonus] = calcItemBuff.get(calcItem.id);
      const extraMult = (itemBonus.mult_ ?? 0) + attPattBonus[ATT_PATT].mult_;

      const record = TrackerControl.initCalcItemRecord({
        itemType: type,
        multFactors: [],
        normalMult: 1,
        exclusives: bonusList,
      });

      // CALCULATE BASE DAMAGE
      for (const factor of toArray(calcItem.multFactors)) {
        const { root, scale, basedOn } = configMultFactor(factor);
        const finalMult = root * CharacterCalc.getTalentMult(scale, level) + extraMult;

        console.log("factor");
        console.log(root, scale, basedOn);

        record.multFactors.push({
          value: totalAttr[basedOn],
          desc: basedOn,
          talentMult: finalMult,
        });
        bases.push((totalAttr[basedOn] * finalMult) / 100);
      }

      if (calcItem.joinMultFactors) {
        bases = [bases.reduce((accumulator, base) => accumulator + base, 0)];
      }

      if (calcItem.flatFactor) {
        const { root, scale } = configFlatFactor(calcItem.flatFactor);
        const flatBonus = root * CharacterCalc.getTalentMult(scale, level);

        bases = bases.map((base) => base + flatBonus);
        record.totalFlat = flatBonus;
      }

      // TALENT DMG
      if (resultKey === "NAs" && disabledNAs && type === "attack") {
        finalResult[resultKey][calcItem.name] = {
          nonCrit: 0,
          crit: 0,
          average: 0,
        };
      } else {
        finalResult[resultKey][calcItem.name] = calcItemCalc.calculate({
          base: bases.length > 1 ? bases : bases[0],
          attPatt,
          attElmt,
          calcType: type,
          rxnMult,
          calcItemBonus: itemBonus,
          record,
        });
      }

      tracker?.recordCalcItem(resultKey, calcItem.name, record);
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
      calcType: type,
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
