import type {
  AttackElement,
  AttackElementInfoKey,
  AttackPatternBonusKey,
  AttributeStat,
  BuffInfoWrap,
  Reaction,
  ReactionBonusInfoKey,
  Teammate,
} from "@Src/types";
import type { GetCalculationStatsArgs, StackableCheckCondition } from "../calculation.types";

import { $AppCharacter, $AppData } from "@Src/services";
import { AMPLIFYING_REACTIONS, CORE_STAT_TYPES, QUICKEN_REACTIONS, TRANSFORMATIVE_REACTIONS } from "@Src/constants";
import { RESONANCE_STAT } from "../calculation.constants";

// Util
import { applyPercent, findByIndex, Setup_, Weapon_, Calculation_ } from "@Src/utils";
import { CharacterCal, applyModifier } from "../utils";
import {
  addArtifactAttributes,
  addTrackerRecord,
  initiateBonuses,
  initiateTotalAttr,
} from "./getCalculationStats.utils";
import applyAbilityBuff from "./applyAbilityBuff";
import applyArtifactBuff from "./applyArtifactBuff";
import applyWeaponBuff from "./applyWeaponBuff";

export const getCalculationStats = ({
  char,
  appChar,
  selfBuffCtrls,
  weapon,
  appWeapon,
  wpBuffCtrls,
  artifacts,
  artBuffCtrls,
  elmtModCtrls,
  party,
  partyData = [],
  customBuffCtrls,
  infusedElement,
  tracker,
}: GetCalculationStatsArgs) => {
  const { resonances = [], reaction, infuse_reaction } = elmtModCtrls || {};
  const { refi } = weapon;
  const setBonuses = Calculation_.getArtifactSetBonuses(artifacts);

  const totalAttr = initiateTotalAttr({ char, appChar, weapon, appWeapon, tracker });
  const { attPattBonus, attElmtBonus, rxnBonus, calcItemBuffs, charStatus } = initiateBonuses();

  const infoWrap: BuffInfoWrap = {
    char,
    appChar,
    partyData,
    charStatus,
    totalAttr,
    attPattBonus,
    attElmtBonus,
    calcItemBuffs,
    rxnBonus,
    infusedElement,
    tracker,
  };

  const usedMods: NonNullable<StackableCheckCondition>[] = [];

  const isStackable = (condition: StackableCheckCondition) => {
    if (condition.trackId) {
      const isUsed = usedMods.some((usedMod) => {
        if (condition.trackId === usedMod.trackId && typeof condition.targets === typeof usedMod.targets) {
          if (Array.isArray(condition.targets)) {
            return (
              condition.targets.length === usedMod.targets.length &&
              condition.targets.every((target, i) => target === usedMod.targets[i])
            );
          }
          return condition.targets === usedMod.targets;
        }
        return false;
      });

      if (isUsed) return false;

      usedMods.push(condition);
    }
    return true;
  };

  const APPLY_SELF_BUFFS = (isFinal: boolean) => {
    const charBuffCtrls = selfBuffCtrls || [];
    const { innateBuffs = [], buffs = [] } = appChar;

    for (const buff of innateBuffs) {
      if (CharacterCal.isGranted(buff, char)) {
        applyAbilityBuff({
          description: `Self / ${buff.src}`,
          buff,
          infoWrap,
          inputs: [],
          fromSelf: true,
          isFinal,
        });
      }
    }
    for (const ctrl of charBuffCtrls) {
      const buff = findByIndex(buffs, ctrl.index);

      if (ctrl.activated && buff && CharacterCal.isGranted(buff, char)) {
        applyAbilityBuff({
          description: `Self / ${buff.src}`,
          buff,
          infoWrap,
          inputs: ctrl.inputs || [],
          fromSelf: true,
          isFinal,
        });
      }
    }
  };

  const APPLY_WEAPON_BONUSES = (isFinal: boolean) => {
    if (appWeapon.bonuses) {
      applyWeaponBuff({
        description: `${appWeapon.name} bonus`,
        buff: {
          effects: appWeapon.bonuses,
        },
        refi,
        inputs: [],
        infoWrap,
        isFinal,
      });
    }
  };

  const APPLY_MAIN_WEAPON_BUFFS = (isFinal: boolean) => {
    if (!appWeapon.buffs || !wpBuffCtrls?.length) return;

    for (const ctrl of wpBuffCtrls) {
      const buff = findByIndex(appWeapon.buffs, ctrl.index);

      if (ctrl.activated && buff) {
        applyWeaponBuff({
          description: `${appWeapon.name} activated`,
          buff,
          infoWrap,
          inputs: ctrl.inputs ?? [],
          refi,
          isFinal,
          // isStackable
        });
      }
    }
  };

  const APPLY_ARTIFACTS_AUTO_BUFFS = (isFinal: boolean) => {
    for (const { code, bonusLv } of setBonuses) {
      //
      for (let i = 0; i <= bonusLv; i++) {
        const data = $AppData.getArtifactSet(code);
        const buff = data?.setBonuses?.[i];

        if (buff && buff.effects) {
          applyArtifactBuff({
            description: `${data.name} / ${i * 2 + 2}-piece bonus`,
            buff: {
              effects: buff.effects,
            },
            infoWrap,
            inputs: [],
            isFinal,
          });
        }
      }
    }
  };

  const APPLY_CUSTOM_BUFFS = () => {
    if (!customBuffCtrls?.length) return;
    const { totalAttr, attElmtBonus, attPattBonus, rxnBonus } = infoWrap;

    const applyToTotalAttr = (type: string, value: number) => {
      const key = type as AttributeStat;

      totalAttr[key] += value;
      addTrackerRecord(tracker?.totalAttr[key], "Custom buff", value);
    };

    for (const { category, type, subType, value } of customBuffCtrls) {
      switch (category) {
        case "totalAttr":
          applyToTotalAttr(type, value);
          break;

        case "attElmtBonus": {
          if (subType === "pct_") {
            applyToTotalAttr(type, value);
          } else if (subType) {
            const key = type as AttackElement;
            const subKey = subType as AttackElementInfoKey;

            attElmtBonus[key][subKey] += value;
            addTrackerRecord(tracker?.attElmtBonus[`${key}.${subKey}`], "Custom buff", value);
          }
          break;
        }
        case "attPattBonus": {
          if (subType) {
            const key = type as AttackPatternBonusKey;

            attPattBonus[key][subType] += value;
            addTrackerRecord(tracker?.attPattBonus[`${key}.${subType}`], "Custom buff", value);
          }
          break;
        }
        case "rxnBonus": {
          const key = type as Reaction;
          const subKey = subType as ReactionBonusInfoKey;

          rxnBonus[key][subKey] += value;
          addTrackerRecord(tracker?.rxnBonus[`${key}.${subKey}`], "Custom buff", value);
          break;
        }
      }
    }
  };

  const APPLY_TEAMMATE_BUFFS = (party: Teammate[]) => {
    for (const teammate of party) {
      const { name, buffs = [] } = $AppCharacter.get(teammate.name);

      for (const { index, activated, inputs = [] } of teammate.buffCtrls) {
        const buff = findByIndex(buffs, index);
        if (!activated || !buff) continue;

        applyAbilityBuff({
          description: `${name} / ${buff.src}`,
          buff,
          infoWrap,
          inputs,
          fromSelf: false,
        });
      }

      // #to-check: should be applied before main weapon buffs?
      (() => {
        const { code, refi } = teammate.weapon;
        const { name, buffs = [] } = $AppData.getWeapon(code) || {};

        for (const ctrl of teammate.weapon.buffCtrls) {
          const buff = findByIndex(buffs, ctrl.index);

          if (ctrl.activated && buff) {
            applyWeaponBuff({
              description: `${name} activated`,
              buff,
              infoWrap,
              inputs: ctrl.inputs ?? [],
              refi,
              isStackable,
            });
          }
        }
      })();

      (() => {
        const { code } = teammate.artifact;
        const { name, buffs = [] } = $AppData.getArtifactSet(code) || {};

        for (const ctrl of teammate.artifact.buffCtrls) {
          const buff = findByIndex(buffs, ctrl.index);

          if (ctrl.activated && buff) {
            applyArtifactBuff({
              description: `${name} / 4-Piece activated`,
              buff,
              infoWrap,
              inputs: ctrl.inputs ?? [],
              isStackable,
            });
          }
        }
      })();
    }
  };

  const mainArtifactData = setBonuses[0]?.code ? $AppData.getArtifactSet(setBonuses[0].code) : undefined;
  const APLY_MAIN_ARTIFACT_BUFFS = (isFinal: boolean) => {
    if (!mainArtifactData) return;

    for (const ctrl of artBuffCtrls || []) {
      const buff = mainArtifactData.buffs?.[ctrl.index];

      if (ctrl.activated && buff) {
        applyArtifactBuff({
          description: `${mainArtifactData.name} (self) / 4-piece activated`,
          buff,
          infoWrap,
          inputs: ctrl.inputs ?? [],
          isFinal,
          isStackable,
        });
      }
    }
  };

  const CALC_FINAL_TOTAL_ATTRIBUTES = () => {
    for (const type of CORE_STAT_TYPES) {
      totalAttr[type] += applyPercent(totalAttr[`base_${type}`], totalAttr[`${type}_`]);
      totalAttr[`${type}_`] = 0;
    }
  };

  APPLY_SELF_BUFFS(false);

  const artAttr = addArtifactAttributes(artifacts, totalAttr, tracker);

  // ========== ADD WEAPON SUBSTAT ==========
  if (appWeapon.subStat) {
    const { type, scale } = appWeapon.subStat;
    const value = Weapon_.getSubStatValue(weapon.level, scale);
    applyModifier(`${appWeapon.name} sub-stat`, totalAttr, type, value, tracker);
  }

  APPLY_WEAPON_BONUSES(false);
  APPLY_ARTIFACTS_AUTO_BUFFS(false);
  APPLY_CUSTOM_BUFFS();

  // APPLY RESONANCE BUFFS
  for (const { vision: elementType, activated, inputs } of resonances) {
    if (activated) {
      const { key, value } = RESONANCE_STAT[elementType];
      let xtraValue = 0;
      const desc = `${elementType} resonance`;

      if (elementType === "dendro" && inputs) {
        if (inputs[0]) xtraValue += 30;
        if (inputs[1]) xtraValue += 20;
      }

      applyModifier(desc, totalAttr, key, value + xtraValue, tracker);

      if (elementType === "geo") {
        applyModifier(desc, attPattBonus, "all.pct_", 15, tracker);
      }
    }
  }

  // APPPLY TEAMMATE BUFFS
  APPLY_TEAMMATE_BUFFS(Setup_.teammatesOf(party));

  APPLY_MAIN_WEAPON_BUFFS(false);
  APLY_MAIN_ARTIFACT_BUFFS(false);

  totalAttr.hp += totalAttr.base_hp;
  totalAttr.atk += totalAttr.base_atk;
  totalAttr.def += totalAttr.base_def;

  CALC_FINAL_TOTAL_ATTRIBUTES();
  APPLY_ARTIFACTS_AUTO_BUFFS(true);
  APPLY_WEAPON_BONUSES(true);
  APPLY_MAIN_WEAPON_BUFFS(true);
  CALC_FINAL_TOTAL_ATTRIBUTES();
  APPLY_SELF_BUFFS(true);
  CALC_FINAL_TOTAL_ATTRIBUTES();
  APLY_MAIN_ARTIFACT_BUFFS(true);

  // CALCULATE FINAL REACTION BONUSES
  const { transformative, amplifying, quicken } = Calculation_.getRxnBonusesFromEM(totalAttr.em);

  for (const rxn of TRANSFORMATIVE_REACTIONS) {
    rxnBonus[rxn].pct_ += transformative;
  }
  for (const rxn of AMPLIFYING_REACTIONS) {
    rxnBonus[rxn].pct_ += amplifying;
  }
  for (const rxn of QUICKEN_REACTIONS) {
    rxnBonus[rxn].pct_ += quicken;
  }
  const { spread, aggravate } = Calculation_.getQuickenBuffDamage(char.level, rxnBonus);

  if (reaction === "spread" || infuse_reaction === "spread") {
    applyModifier("Spread reaction", attElmtBonus, "dendro.flat", spread, tracker);
  }
  if (reaction === "aggravate" || infuse_reaction === "aggravate") {
    applyModifier("Aggravate reaction", attElmtBonus, "electro.flat", aggravate, tracker);
  }

  return {
    charStatus,
    totalAttr,
    attPattBonus,
    attElmtBonus,
    calcItemBuffs,
    rxnBonus,
    artAttr,
  };
};
