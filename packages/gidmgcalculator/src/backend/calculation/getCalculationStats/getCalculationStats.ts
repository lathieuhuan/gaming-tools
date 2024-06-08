import type { AttackElement, AttackPattern, AttributeStat, ReactionType } from "@Src/backend/types";
import type { BuffInfoWrap, GetCalculationStatsArgs, StackableCheckCondition } from "./getCalculationStats.types";

import { AMPLIFYING_REACTIONS, QUICKEN_REACTIONS, TRANSFORMATIVE_REACTIONS } from "@Src/backend/constants";
import { ECalcStatModule, RESONANCE_STAT } from "@Src/backend/constants/internal";

import { $AppCharacter, $AppWeapon, $AppArtifact } from "@Src/services";
import { findByIndex } from "@Src/utils";
import { EntityCalc, GeneralCalc } from "@Src/backend/utils";
import { AttackBonusControl, TotalAttributeControl } from "@Src/backend/controls";
import ApplierCharacterBuff from "./applier-character-buff";
import ApplierWeaponBuff from "./applier-weapon-buff";
import ApplierArtifactBuff from "./applier-artifact-buff";

export default function getCalculationStats({
  char,
  appChar,
  weapon,
  appWeapon,
  artifacts,
  party = [],
  partyData = [],
  elmtModCtrls,
  selfBuffCtrls = [],
  wpBuffCtrls,
  artBuffCtrls,
  customBuffCtrls,
  tracker,
}: GetCalculationStatsArgs) {
  const { refi } = weapon;
  const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);
  const { resonances = [], reaction, infuse_reaction } = elmtModCtrls || {};

  const totalAttr = new TotalAttributeControl(undefined, (stat, value, description) => {
    tracker?.recordStat(ECalcStatModule.ATTR, stat, value, description);
  });
  const artAttr = totalAttr.construct(char, appChar, weapon, appWeapon, artifacts);

  const attBonus = new AttackBonusControl();

  const infoWrap: BuffInfoWrap = {
    char,
    appChar,
    partyData,
    totalAttr,
    attBonus,
  };

  const characterBuff = new ApplierCharacterBuff(infoWrap);
  const weaponBuff = new ApplierWeaponBuff(infoWrap);
  const artifactBuff = new ApplierArtifactBuff(infoWrap);
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
    const { innateBuffs = [], buffs = [] } = appChar;
    const inputs: number[] = [];

    for (const buff of innateBuffs) {
      if (EntityCalc.isGrantedEffect(buff, char)) {
        characterBuff.apply({
          description: `Self / ${buff.src}`,
          buff,
          inputs,
          fromSelf: true,
          isFinal,
        });
      }
    }
    for (const ctrl of selfBuffCtrls) {
      const buff = findByIndex(buffs, ctrl.index);

      if (ctrl.activated && buff && EntityCalc.isGrantedEffect(buff, char)) {
        characterBuff.apply({
          description: `Self / ${buff.src}`,
          buff,
          inputs: ctrl.inputs ?? [],
          fromSelf: true,
          isFinal,
        });
      }
    }
  };

  const APPLY_WEAPON_BONUSES = (isFinal: boolean) => {
    if (appWeapon.bonuses) {
      weaponBuff.apply({
        description: `${appWeapon.name} bonus`,
        buff: {
          effects: appWeapon.bonuses,
        },
        refi,
        inputs: [],
        fromSelf: true,
        isFinal,
      });
    }
  };

  const APPLY_ARTIFACTS_BONUSES = (isFinal: boolean) => {
    for (const { code, bonusLv } of setBonuses) {
      for (let i = 0; i <= bonusLv; i++) {
        const data = $AppArtifact.getSet(code);
        const buff = data?.setBonuses?.[i];

        if (buff && buff.effects) {
          artifactBuff.apply({
            description: `${data.name} / ${i * 2 + 2}-piece bonus`,
            buff: {
              effects: buff.effects,
            },
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
            attBonus.add(key, subType, value, "Custom buff");
          }
          break;
        }
        case "attPattBonus": {
          if (subType) {
            const key = type as AttackPattern | "all";
            attBonus.add(key, subType, value, "Custom buff");
          }
          break;
        }
        case "rxnBonus": {
          if (subType) {
            const key = type as ReactionType;
            attBonus.add(key, subType, value, "Custom buff");
          }
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

        characterBuff.apply({
          description: `${name} / ${buff.src}`,
          buff,
          inputs,
          fromSelf: false,
        });
      }

      // #to-check: should be applied before main weapon buffs?
      (() => {
        const { code, refi } = teammate.weapon;
        const { name, buffs = [] } = $AppWeapon.get(code) || {};

        for (const ctrl of teammate.weapon.buffCtrls) {
          const buff = findByIndex(buffs, ctrl.index);

          if (ctrl.activated && buff) {
            weaponBuff.apply({
              description: `${name} activated`,
              buff,
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
        const { name, buffs = [] } = $AppArtifact.getSet(code) || {};

        for (const ctrl of teammate.artifact.buffCtrls) {
          const buff = findByIndex(buffs, ctrl.index);

          if (ctrl.activated && buff) {
            artifactBuff.apply({
              description: `${name} / 4-Piece activated`,
              buff,
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
        weaponBuff.apply({
          description: `${appWeapon.name} activated`,
          buff,
          inputs: ctrl.inputs ?? [],
          refi,
          fromSelf: true,
          isFinal,
          // isStackable
        });
      }
    }
  };

  const mainArtifactData = setBonuses[0]?.code ? $AppArtifact.getSet(setBonuses[0].code) : undefined;
  const APLY_MAIN_ARTIFACT_BUFFS = (isFinal: boolean) => {
    if (!mainArtifactData) return;

    for (const ctrl of artBuffCtrls || []) {
      const buff = mainArtifactData.buffs?.[ctrl.index];

      if (ctrl.activated && buff) {
        artifactBuff.apply({
          description: `${mainArtifactData.name} (self) / 4-piece activated`,
          buff,
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

      if (elementType === "geo") attBonus.add("all", "pct_", 15, desc);
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

  const { transformative, amplifying, quicken } = GeneralCalc.getRxnBonusesFromEM(totalAttr.getTotal("em", "ALL"));

  for (const rxn of TRANSFORMATIVE_REACTIONS) {
    attBonus.add(rxn, "pct_", transformative, "From Elemental Mastery");
  }
  for (const rxn of AMPLIFYING_REACTIONS) {
    attBonus.add(rxn, "pct_", amplifying, "From Elemental Mastery");
  }
  for (const rxn of QUICKEN_REACTIONS) {
    attBonus.add(rxn, "pct_", quicken, "From Elemental Mastery");
  }

  if (reaction === "spread" || infuse_reaction === "spread") {
    const bonusValue = GeneralCalc.getQuickenBuffDamage("spread", char.level, attBonus.get("pct_", "spread"));
    attBonus.add("dendro", "flat", bonusValue, "Spread reaction");
  }
  if (reaction === "aggravate" || infuse_reaction === "aggravate") {
    const bonusValue = GeneralCalc.getQuickenBuffDamage("aggravate", char.level, attBonus.get("pct_", "aggravate"));
    attBonus.add("electro", "flat", bonusValue, "Aggravate reaction");
  }

  return {
    totalAttr: totalAttr.finalize(),
    attBonus,
    artAttr,
  };
}
