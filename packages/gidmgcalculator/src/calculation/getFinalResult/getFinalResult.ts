import type {
  CalcItemBonus,
  CalculationFinalResult,
  DebuffInfoWrap,
  NormalAttack,
  ResistanceReduction,
  TrackerCalcItemRecord,
} from "@Src/types";
import type { GetFinalResultArgs } from "../calculation.types";
import { $AppCharacter, $AppData } from "@Src/services";

// Constant
import { ATTACK_ELEMENTS, ATTACK_PATTERNS, TRANSFORMATIVE_REACTIONS, ELEMENT_TYPES } from "@Src/constants";
import { TRANSFORMATIVE_REACTION_INFO } from "../calculation.constants";

// Util
import { findByIndex, toArray, Calculation_, Setup_, Character_ } from "@Src/utils";
import { CharacterCal, applyModifier } from "../utils";
import { getExclusiveBonus } from "./getFinalResult.utils";
import applyAbilityDebuff from "./applyAbilityDebuff";
import calculateItem from "./calculateItem";

export default function getFinalResult({
  char,
  appChar,
  selfDebuffCtrls,
  artDebuffCtrls,
  party,
  partyData,
  disabledNAs,
  totalAttr,
  attPattBonus,
  attElmtBonus,
  calcItemBuffs,
  rxnBonus,
  customDebuffCtrls,
  infusion,
  elmtModCtrls: { reaction, infuse_reaction, resonances, superconduct, absorption },
  target,
  tracker,
}: GetFinalResultArgs) {
  const resistReduct = { def: 0 } as ResistanceReduction;

  for (const key of ATTACK_ELEMENTS) {
    resistReduct[key] = 0;
  }
  const { multFactorConf, calcList, weaponType, vision: elementType, debuffs } = appChar;
  const infoWrap: DebuffInfoWrap = {
    char,
    appChar,
    partyData,
    resistReduct,
    tracker,
  };

  // APPLY CUSTOM DEBUFFS
  for (const { type, value } of customDebuffCtrls) {
    applyModifier("Custom Debuff", resistReduct, type, value, tracker);
  }

  // APPLY SELF DEBUFFS
  for (const { activated, inputs = [], index } of selfDebuffCtrls) {
    const debuff = findByIndex(debuffs || [], index);

    if (activated && debuff?.effects && CharacterCal.isGranted(debuff, char)) {
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
  for (const teammate of Setup_.teammatesOf(party)) {
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

      if (debuffs[index]) {
        const { value, path, inpIndex = 0 } = debuffs[index].effects;
        const elementIndex = inputs?.[inpIndex] ?? 0;
        const finalPath = path === "inp_elmt" ? ELEMENT_TYPES[elementIndex] : path;
        applyModifier(`${name} / 4-piece activated`, resistReduct, finalPath, value, tracker);
      }
    }
  }

  // APPLY RESONANCE DEBUFFS
  const geoRsn = resonances.find((rsn) => rsn.vision === "geo");
  if (geoRsn && geoRsn.activated) {
    applyModifier("Geo resonance", resistReduct, "geo", 20, tracker);
  }
  if (superconduct) {
    applyModifier("Superconduct", resistReduct, "phys", 40, tracker);
  }

  // CALCULATE RESISTANCE REDUCTION
  for (const key of [...ATTACK_ELEMENTS]) {
    let RES = (target.resistances[key] - resistReduct[key]) / 100;
    resistReduct[key] = RES < 0 ? 1 - RES / 2 : RES >= 0.75 ? 1 / (4 * RES + 1) : 1 - RES;
  }

  const finalResult: CalculationFinalResult = {
    NAs: {},
    ES: {},
    EB: {},
    RXN: {},
  };

  if (tracker) {
    tracker.NAs = {};
    tracker.ES = {};
    tracker.EB = {};
    tracker.RXN = {};
  }

  ATTACK_PATTERNS.forEach((ATT_PATT) => {
    const resultKey = ATT_PATT === "ES" || ATT_PATT === "EB" ? ATT_PATT : "NAs";
    const defaultInfo = Character_.getTalentDefaultInfo(resultKey, weaponType, elementType, ATT_PATT, multFactorConf);
    const level = Character_.getFinalTalentLv({ appChar, talentType: resultKey, char, partyData });

    for (const stat of calcList[ATT_PATT]) {
      // DMG TYPES & AMPLIFYING REACTION MULTIPLIER
      const attPatt = stat.attPatt || ATT_PATT;
      let attElmt =
        (stat.subAttPatt === "FCA" ? elementType : stat.attElmt === "absorb" ? absorption : stat.attElmt) ??
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
        rxnMult = Calculation_.getAmplifyingMultiplier(attElmt, rxnBonus)[actualReaction];
      }

      let bases = [];
      const { id, type = "attack", flatFactor } = stat;
      const calcItemBonues = id
        ? calcItemBuffs.reduce<CalcItemBonus[]>((bonuses, buff) => {
            if (Array.isArray(buff.ids) ? buff.ids.includes(id) : buff.ids === id) {
              bonuses.push(buff.bonus);
            }
            return bonuses;
          }, [])
        : [];
      const itemBonusMult = getExclusiveBonus(calcItemBonues, "mult_");

      const record = {
        itemType: type,
        multFactors: [],
        normalMult: 1,
        exclusives: calcItemBonues,
      } as TrackerCalcItemRecord;

      // CALCULATE BASE DAMAGE
      for (const factor of toArray(stat.multFactors)) {
        const {
          root,
          scale = defaultInfo.scale,
          basedOn = defaultInfo.basedOn,
        } = typeof factor === "number" ? { root: factor } : factor;

        const finalMult = root * Character_.getTalentMult(scale, level) + itemBonusMult + attPattBonus[ATT_PATT].mult_;

        let flatBonus = 0;

        if (flatFactor) {
          const { root, scale = defaultInfo.flatFactorScale } =
            typeof flatFactor === "number" ? { root: flatFactor } : flatFactor;

          flatBonus = root * Character_.getTalentMult(scale, level);
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
        finalResult[resultKey][stat.name] = calculateItem({
          stat,
          attPatt,
          attElmt,
          base: bases.length > 1 ? bases : bases[0],
          char,
          target,
          totalAttr,
          attPattBonus,
          attElmtBonus,
          calcItemBonues,
          rxnMult,
          resistReduct,
          record,
        });
      }
      if (tracker) {
        tracker[resultKey][stat.name] = record;
      }
    }
  });

  const baseRxnDmg = Calculation_.getBaseRxnDmg(char.level);

  for (const rxn of TRANSFORMATIVE_REACTIONS) {
    const { mult, dmgType } = TRANSFORMATIVE_REACTION_INFO[rxn];
    const normalMult = 1 + rxnBonus[rxn].pct_ / 100;
    const resMult = dmgType !== "absorb" ? resistReduct[dmgType] : 1;
    const baseValue = baseRxnDmg * mult;
    const nonCrit = baseValue * normalMult * resMult;
    const cDmg_ = rxnBonus[rxn].cDmg_ / 100;
    const cRate_ = rxnBonus[rxn].cRate_ / 100;

    finalResult.RXN[rxn] = {
      nonCrit,
      crit: cDmg_ ? nonCrit * (1 + cDmg_) : 0,
      average: cRate_ ? nonCrit * (1 + cDmg_ * cRate_) : 0,
      attElmt: dmgType,
    };

    if (tracker) {
      tracker.RXN[rxn] = {
        itemType: "attack",
        multFactors: [{ value: Math.round(baseValue), desc: "Base DMG" }],
        normalMult,
        resMult,
        cDmg_,
        cRate_,
      };
    }
  }

  return finalResult;
}
