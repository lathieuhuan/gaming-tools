import type { Artifact, Character, ElementModCtrl, ModifierCtrl, PartyData, Weapon } from "@Src/types";
import type { AppCharacter, AppWeapon } from "@Src/backend/types";

import { RESONANCE_STAT } from "@Src/backend/constants/internal.constants";
import { findByIndex } from "@Src/utils";
import { EntityCalc, GeneralCalc, WeaponCalc } from "@Src/backend/utils";
import { AttackBonusControl, TotalAttributeControl, calcArtifactAtribute } from "@Src/backend/controls";
import {
  ApplierArtifactBuff,
  ApplierCharacterBuff,
  ApplierWeaponBuff,
  BuffInfoWrap,
  StackableCheckCondition,
} from "@Src/backend/appliers";
import { AMPLIFYING_REACTIONS, QUICKEN_REACTIONS, TRANSFORMATIVE_REACTIONS } from "../constants";

type GetMemberStatsArgs = {
  char: Character;
  appChar: AppCharacter;
  weapon: Weapon;
  appWeapon: AppWeapon;
  artifacts: Array<Artifact | null>;
  // party?: Party;
  partyData: PartyData;
  elmtModCtrls: ElementModCtrl;
  selfBuffCtrls: ModifierCtrl[];
  // wpBuffCtrls?: ModifierCtrl[];
  // artBuffCtrls?: ModifierCtrl[];
  // customBuffCtrls?: CustomBuffCtrl[];
  // customInfusion?: Infusion;
};
export default function getMemberStats({
  char,
  appChar,
  weapon,
  appWeapon,
  artifacts,
  partyData,
  elmtModCtrls,
  selfBuffCtrls,
}: GetMemberStatsArgs) {
  const { refi } = weapon;
  const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);
  const { resonances = [], reaction, infuse_reaction } = elmtModCtrls;

  const totalAttr = new TotalAttributeControl(
    char,
    appChar,
    WeaponCalc.getMainStatValue(weapon.level, appWeapon.mainStatScale)
    // tracker
  );

  calcArtifactAtribute(artifacts, totalAttr);

  const attBonus = new AttackBonusControl();

  if (appWeapon.subStat) {
    const subStatValue = WeaponCalc.getSubStatValue(weapon.level, appWeapon.subStat.scale);
    totalAttr.addStable(appWeapon.subStat.type, subStatValue, `${appWeapon.name} sub-stat`);
  }

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

  APPLY_SELF_BUFFS(false);

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

  APPLY_SELF_BUFFS(true);

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
  };
}
