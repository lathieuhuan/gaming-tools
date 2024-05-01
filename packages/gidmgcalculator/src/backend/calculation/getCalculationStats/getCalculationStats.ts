import type {
  AttackElement,
  AttackElementInfoKey,
  AttackPatternBonusKey,
  AttributeStat,
  ReactionBonusInfoKey,
  ReactionType,
} from "@Src/backend/types";
import type { BuffInfoWrap, GetCalculationStatsArgs, StackableCheckCondition } from "./getCalculationStats.types";

import { AMPLIFYING_REACTIONS, QUICKEN_REACTIONS, TRANSFORMATIVE_REACTIONS } from "@Src/backend/constants";
import { RESONANCE_STAT } from "../calculation.constants";

import { $AppCharacter, $AppData } from "@Src/services";
import { findByIndex } from "@Src/utils";
import { EntityCalc, GeneralCalc, WeaponCalc } from "../utils";
import { ArtifactAttributeControl, BonusControl, CalcItemBuffControl, TotalAttributeControl } from "../controls";
import applyCharacterBuff from "./applyCharacterBuff";
import applyWeaponBuff from "./applyWeaponBuff";
import applyArtifactBuff from "./applyArtifactBuff";

export default function getCalculationStats({
  char,
  appChar,
  weapon,
  appWeapon,
  artifacts,
  party = [],
  partyData = [],
  elmtModCtrls,
  selfBuffCtrls,
  wpBuffCtrls,
  artBuffCtrls,
  customBuffCtrls,
  infusedElement,
  tracker,
}: GetCalculationStatsArgs) {
  const { refi } = weapon;
  const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);
  const { resonances = [], reaction, infuse_reaction } = elmtModCtrls || {};

  const totalAttr = new TotalAttributeControl(tracker).create(
    char,
    appChar,
    WeaponCalc.getMainStatValue(weapon.level, appWeapon.mainStatScale)
  );
  const artAttr = new ArtifactAttributeControl(artifacts, totalAttr).getValues();
  const bonusCalc = new BonusControl(tracker);
  const calcItemBuff = new CalcItemBuffControl();

  if (appWeapon.subStat) {
    const subStatValue = WeaponCalc.getSubStatValue(weapon.level, appWeapon.subStat.scale);
    totalAttr.addStable(appWeapon.subStat.type, subStatValue, `${appWeapon.name} sub-stat`);
  }

  const infoWrap: BuffInfoWrap = {
    char,
    appChar,
    partyData,
    totalAttr,
    bonusCalc,
    calcItemBuff,
    infusedElement,
  };

  const usedMods: NonNullable<StackableCheckCondition>[] = [];

  const isStackable = (condition: StackableCheckCondition) => {
    if (condition.trackId) {
      const isUsed = usedMods.some((usedMod) => {
        if (condition.trackId === usedMod.trackId && typeof condition.paths === typeof usedMod.paths) {
          if (Array.isArray(condition.paths)) {
            return (
              condition.paths.length === usedMod.paths.length &&
              condition.paths.every((target, i) => target === usedMod.paths[i])
            );
          }
          return condition.paths === usedMod.paths;
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
      if (EntityCalc.isGrantedEffect(buff, char)) {
        applyCharacterBuff({
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

      if (ctrl.activated && buff && EntityCalc.isGrantedEffect(buff, char)) {
        applyCharacterBuff({
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
        fromSelf: true,
        isFinal,
      });
    }
  };

  const APPLY_ARTIFACTS_BONUSES = (isFinal: boolean) => {
    for (const { code, bonusLv } of setBonuses) {
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
            fromSelf: true,
            isFinal,
          });
        }
      }
    }
  };

  const APPLY_CUSTOM_BUFFS = () => {
    if (!customBuffCtrls?.length) return;
    const { totalAttr } = infoWrap;

    for (const { category, type, subType, value } of customBuffCtrls) {
      switch (category) {
        case "totalAttr":
          totalAttr.addStable(type as AttributeStat, value, "Custom buff");
          break;
        case "attElmtBonus": {
          if (subType === "pct_") {
            totalAttr.addStable(type as AttributeStat, value, "Custom buff");
          } else if (subType) {
            const key = type as AttackElement;
            const subKey = subType as AttackElementInfoKey;
            bonusCalc.add("ELMT", `${key}.${subKey}`, value, "Custom buff");
          }
          break;
        }
        case "attPattBonus": {
          if (subType) {
            const key = type as AttackPatternBonusKey;
            bonusCalc.add("PATT", `${key}.${subType}`, value, "Custom buff");
          }
          break;
        }
        case "rxnBonus": {
          const key = type as ReactionType;
          const subKey = subType as ReactionBonusInfoKey;
          bonusCalc.add("RXN", `${key}.${subKey}`, value, "Custom buff");
          break;
        }
      }
    }
  };

  const APPLY_TEAMMATE_BUFFS = () => {
    for (const teammate of party) {
      if (!teammate) continue;
      const { name, buffs = [] } = $AppCharacter.get(teammate.name);

      for (const { index, activated, inputs = [] } of teammate.buffCtrls) {
        const buff = findByIndex(buffs, index);
        if (!activated || !buff) continue;

        applyCharacterBuff({
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
              fromSelf: false,
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
              fromSelf: false,
              isStackable,
            });
          }
        }
      })();
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
          fromSelf: true,
          isFinal,
          // isStackable
        });
      }
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
          fromSelf: true,
          isStackable,
        });
      }
    }
  };

  APPLY_SELF_BUFFS(false);
  APPLY_WEAPON_BONUSES(false);
  APPLY_ARTIFACTS_BONUSES(false);
  APPLY_CUSTOM_BUFFS();

  for (const { vision: elementType, activated, inputs } of resonances) {
    if (activated) {
      const { key, value } = RESONANCE_STAT[elementType];
      let xtraValue = 0;
      const desc = `${elementType} resonance`;

      if (elementType === "dendro" && inputs) {
        if (inputs[0]) xtraValue += 30;
        if (inputs[1]) xtraValue += 20;
      }

      totalAttr.addStable(key, value + xtraValue, desc);

      if (elementType === "geo") bonusCalc.add("PATT", "all.pct_", 15, desc);
    }
  }

  APPLY_TEAMMATE_BUFFS();
  APPLY_MAIN_WEAPON_BUFFS(false);
  APLY_MAIN_ARTIFACT_BUFFS(false);

  APPLY_ARTIFACTS_BONUSES(true);
  APPLY_WEAPON_BONUSES(true);
  APPLY_MAIN_WEAPON_BUFFS(true);
  APPLY_SELF_BUFFS(true);
  APLY_MAIN_ARTIFACT_BUFFS(true);

  const { transformative, amplifying, quicken } = GeneralCalc.getRxnBonusesFromEM(totalAttr.getTotal("em"));

  for (const rxn of TRANSFORMATIVE_REACTIONS) {
    bonusCalc.add("RXN", `${rxn}.pct_`, transformative, "TRANSFORMATIVE");
  }
  for (const rxn of AMPLIFYING_REACTIONS) {
    bonusCalc.add("RXN", `${rxn}.pct_`, amplifying, "AMPLIFYING");
  }
  for (const rxn of QUICKEN_REACTIONS) {
    bonusCalc.add("RXN", `${rxn}.pct_`, quicken, "QUICKEN");
  }

  const rxnBonus = bonusCalc.serialize("RXN");
  const { spread, aggravate } = GeneralCalc.getQuickenBuffDamage(char.level, rxnBonus);

  if (reaction === "spread" || infuse_reaction === "spread") {
    bonusCalc.add("ELMT", "dendro.flat", spread, "Spread reaction");
  }
  if (reaction === "aggravate" || infuse_reaction === "aggravate") {
    bonusCalc.add("ELMT", "electro.flat", aggravate, "Aggravate reaction");
  }

  return {
    totalAttr: totalAttr.finalize(),
    attPattBonus: bonusCalc.serialize("PATT"),
    attElmtBonus: bonusCalc.serialize("ELMT"),
    rxnBonus,
    calcItemBuff,
    artAttr,
    // calcInfusion,
    // disabledNAs,
  };
}
