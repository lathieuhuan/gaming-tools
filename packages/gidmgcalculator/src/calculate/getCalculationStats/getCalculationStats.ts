import type {
  AttackElement,
  AttackElementInfoKey,
  AttackPatternBonusKey,
  AttributeStat,
  CalcItemBuff,
  CharacterStatus,
  Reaction,
  ReactionBonusInfoKey,
} from "@Src/types";
import type { BuffInfoWrap, GetCalculationStatsArgs, StackableCheckCondition } from "../types";

import { AMPLIFYING_REACTIONS, QUICKEN_REACTIONS, TRANSFORMATIVE_REACTIONS } from "@Src/constants";
import { $AppCharacter, $AppData } from "@Src/services";
import { Calculation_, Setup_, Weapon_, findByIndex } from "@Src/utils";
import { RESONANCE_STAT } from "../constants";
import { ArtifactAttributeCalc, BonusCalc, CharacterCal, TotalAttributeCalc } from "../utils";
import applyAbilityBuff from "./applyAbilityBuff";
import applyArtifactBuff from "./applyArtifactBuff";
import applyWeaponBuff from "./applyWeaponBuff";

export function getCalculationStats({
  char,
  appChar,
  weapon,
  appWeapon,
  artifacts,
  party,
  partyData,
  elmtModCtrls,
  selfBuffCtrls,
  wpBuffCtrls,
  artBuffCtrls,
  customBuffCtrls,
  infusedElement,
  tracker,
}: GetCalculationStatsArgs) {
  const { refi } = weapon;
  const setBonuses = Calculation_.getArtifactSetBonuses(artifacts);
  const { resonances = [], reaction, infuse_reaction } = elmtModCtrls || {};

  const charStatus: CharacterStatus = {
    BOL: 0,
  };
  const totalAttr = new TotalAttributeCalc(tracker).create(
    char,
    appChar,
    Weapon_.getMainStatValue(weapon.level, appWeapon.mainStatScale)
  );
  const artAttr = new ArtifactAttributeCalc(artifacts, totalAttr).getValues();
  const bonusCalc = new BonusCalc(tracker);
  const calcItemBuffs: CalcItemBuff[] = [];

  if (appWeapon.subStat) {
    const subStatValue = Weapon_.getSubStatValue(weapon.level, appWeapon.subStat.scale);
    totalAttr.addStable(appWeapon.subStat.type, subStatValue, `${appWeapon.name} sub-stat`);
  }

  const infoWrap: BuffInfoWrap = {
    char,
    appChar,
    partyData,
    charStatus,
    totalAttr,
    bonusCalc,
    calcItemBuffs,
    infusedElement,
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
          const key = type as Reaction;
          const subKey = subType as ReactionBonusInfoKey;
          bonusCalc.add("RXN", `${key}.${subKey}`, value, "Custom buff");
          break;
        }
      }
    }
  };

  const APPLY_TEAMMATE_BUFFS = () => {
    for (const teammate of Setup_.teammatesOf(party)) {
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

  const { transformative, amplifying, quicken } = Calculation_.getRxnBonusesFromEM(totalAttr.getTotal("em"));

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
  const { spread, aggravate } = Calculation_.getQuickenBuffDamage(char.level, rxnBonus);

  if (reaction === "spread" || infuse_reaction === "spread") {
    bonusCalc.add("ELMT", "dendro.flat", spread, "Spread reaction");
  }
  if (reaction === "aggravate" || infuse_reaction === "aggravate") {
    bonusCalc.add("ELMT", "electro.flat", aggravate, "Aggravate reaction");
  }

  return {
    charStatus,
    totalAttr,
    attPattBonus: bonusCalc.serialize("PATT"),
    attElmtBonus: bonusCalc.serialize("ELMT"),
    rxnBonus,
    calcItemBuffs,
    artAttr,
    // calcInfusion,
    // disabledNAs,
  };
}
