import type { PartiallyRequiredOnly } from "rond";
import type { AppCharacter, AppWeapon, AttackElement, AttackPattern, AttributeStat, ReactionType } from "../types";
import type { CalcSetup, PartyData } from "@Src/types";

import { RESONANCE_STAT, AMPLIFYING_REACTIONS, QUICKEN_REACTIONS, TRANSFORMATIVE_REACTIONS } from "../constants";

import { $AppArtifact, $AppCharacter, $AppWeapon } from "@Src/services";
import Array_ from "@Src/utils/array-utils";
import { GeneralCalc } from "../common-utils";
import { AttackBonusesControl, TotalAttributeControl, TrackerControl } from "../controls";
import { isGrantedEffect } from "../calculation-utils/isGrantedEffect";
import { AppliedBonusesGetter } from "../calculation-utils/applied-bonuses-getter";

type AssistantInfo = {
  appChar: AppCharacter;
  appWeapon: AppWeapon;
  partyData?: PartyData;
};

export default function getCalculationStats(
  {
    char,
    weapon,
    artifacts,
    party = [],
    elmtModCtrls,
    selfBuffCtrls = [],
    wpBuffCtrls = [],
    artBuffCtrls = [],
    customBuffCtrls = [],
  }: PartiallyRequiredOnly<CalcSetup, "char" | "weapon" | "artifacts">,
  { appChar, appWeapon, partyData = [] }: AssistantInfo,
  tracker?: TrackerControl
) {
  const { refi } = weapon;
  const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);
  const { resonances = [], reaction, infuse_reaction } = elmtModCtrls || {};

  const totalAttrCtrl = new TotalAttributeControl(tracker).construct(char, appChar, weapon, appWeapon, artifacts);
  const attkBonusesCtrl = new AttackBonusesControl();
  const bonusesGetter = new AppliedBonusesGetter(
    {
      char,
      appChar,
      partyData,
    },
    totalAttrCtrl
  );

  const applyBuff: AppliedBonusesGetter["getAppliedBonuses"] = (...args) => {
    const result = bonusesGetter.getAppliedBonuses(...args);
    totalAttrCtrl.applyBonuses(result.attrBonuses);
    attkBonusesCtrl.add(result.attkBonuses);
    return result;
  };

  const applySelfBuffs = (isFinal: boolean) => {
    const { innateBuffs = [], buffs = [] } = appChar;

    for (const buff of innateBuffs) {
      if (isGrantedEffect(buff, char)) {
        applyBuff(
          buff,
          {
            inputs: [],
            fromSelf: true,
          },
          `Self / ${buff.src}`,
          isFinal
        );
      }
    }
    for (const ctrl of selfBuffCtrls) {
      const buff = Array_.findByIndex(buffs, ctrl.index);

      if (ctrl.activated && buff && isGrantedEffect(buff, char)) {
        applyBuff(
          buff,
          {
            inputs: ctrl.inputs ?? [],
            fromSelf: true,
          },
          `Self / ${buff.src}`,
          isFinal
        );
      }
    }
  };

  const applyWeaponBonuses = (isFinal: boolean) => {
    if (appWeapon.bonuses) {
      applyBuff(
        { effects: appWeapon.bonuses },
        {
          inputs: [],
          fromSelf: true,
          refi,
        },
        `${appWeapon.name} bonus`,
        isFinal
      );
    }
  };

  const applyArtifactBonuses = (isFinal: boolean) => {
    for (const { code, bonusLv } of setBonuses) {
      for (let i = 0; i <= bonusLv; i++) {
        const data = $AppArtifact.getSet(code);
        const buff = data?.setBonuses?.[i];

        if (buff && buff.effects) {
          applyBuff(
            { effects: buff.effects },
            {
              inputs: [],
              fromSelf: true,
            },
            `${data.name} / ${i * 2 + 2}-piece bonus`,
            isFinal
          );
        }
      }
    }
  };

  const applyMainWeaponBuffs = (isFinal: boolean) => {
    if (!appWeapon.buffs) return;

    for (const ctrl of wpBuffCtrls) {
      const buff = Array_.findByIndex(appWeapon.buffs, ctrl.index);

      if (ctrl.activated && buff) {
        applyBuff(
          buff,
          {
            inputs: ctrl.inputs ?? [],
            refi,
            fromSelf: true,
          },
          `${appWeapon.name} activated`,
          isFinal
        );
      }
    }
  };

  const applyMainArtifactBuffs = (isFinal: boolean) => {
    for (const ctrl of artBuffCtrls) {
      if (ctrl.activated) {
        const { name, buffs = [] } = $AppArtifact.getSet(ctrl.code) || {};
        const buff = Array_.findByIndex(buffs, ctrl.index);

        // Currently only Obsidian Codex has 2 buffs,
        // buff index 0 is for 2-piece, buff index 1 is for 4-piece,
        // Other sets only have 1 buff index 0

        if (buff) {
          const numOfPieces = buffs.length === 2 ? (ctrl.index + 1) * 2 : 4;

          applyBuff(
            buff,
            {
              inputs: ctrl.inputs ?? [],
              fromSelf: true,
            },
            `${name} (self) / ${numOfPieces}-piece bonus`,
            isFinal
          );
        }
      }
    }
  };

  applySelfBuffs(false);
  applyWeaponBonuses(false);
  applyArtifactBonuses(false);

  // APPLY CUSTOM BUFFS
  for (const { category, type, subType, value } of customBuffCtrls) {
    switch (category) {
      case "totalAttr":
        totalAttrCtrl.applyBonuses({
          value,
          toStat: type as AttributeStat,
          description: "Custom buff",
        });
        break;
      case "attElmtBonus": {
        if (subType === "pct_") {
          totalAttrCtrl.applyBonuses({
            value,
            toStat: type as AttributeStat,
            description: "Custom buff",
          });
        } else if (subType) {
          attkBonusesCtrl.add({
            value,
            toType: type as AttackElement,
            toKey: subType,
            description: "Custom buff",
          });
        }
        break;
      }
      case "attPattBonus": {
        if (subType) {
          attkBonusesCtrl.add({
            value,
            toType: type as AttackPattern | "all",
            toKey: subType,
            description: "Custom buff",
          });
        }
        break;
      }
      case "rxnBonus": {
        if (subType) {
          attkBonusesCtrl.add({ value, toType: type as ReactionType, toKey: subType, description: "Custom buff" });
        }
        break;
      }
    }
  }

  // APPLY RESONANCE BONUSES
  for (const { vision: elementType, activated, inputs } of resonances) {
    if (activated) {
      const { key, value } = RESONANCE_STAT[elementType];
      let xtraValue = 0;
      const description = `${elementType} resonance`;

      if (elementType === "dendro" && inputs) {
        if (inputs[0]) xtraValue += 30;
        if (inputs[1]) xtraValue += 20;
      }

      totalAttrCtrl.applyBonuses({
        value: value + xtraValue,
        toStat: key,
        description,
      });

      if (elementType === "geo")
        attkBonusesCtrl.add({
          value: 15,
          toType: "all",
          toKey: "pct_",
          description,
        });
    }
  }

  // APPLY TEAMMATE BUFFS
  for (const teammate of party) {
    if (!teammate) continue;
    const { name, buffs = [] } = $AppCharacter.get(teammate.name);

    for (const { index, activated, inputs = [] } of teammate.buffCtrls) {
      const buff = Array_.findByIndex(buffs, index);
      if (!activated || !buff) continue;

      applyBuff(
        buff,
        {
          inputs,
          fromSelf: false,
        },
        `${name} / ${buff.src}`
      );
    }

    // #to-check: should be applied before main weapon buffs?
    (() => {
      const { code, refi } = teammate.weapon;
      const { name, buffs = [] } = $AppWeapon.get(code) || {};

      for (const ctrl of teammate.weapon.buffCtrls) {
        const buff = Array_.findByIndex(buffs, ctrl.index);

        if (ctrl.activated && buff) {
          applyBuff(
            buff,
            {
              inputs: ctrl.inputs ?? [],
              fromSelf: false,
              refi,
            },
            `${name} activated`
          );
        }
      }
    })();

    (() => {
      const { code } = teammate.artifact;
      const { name, buffs = [] } = $AppArtifact.getSet(code) || {};

      for (const ctrl of teammate.artifact.buffCtrls) {
        const buff = Array_.findByIndex(buffs, ctrl.index);

        if (ctrl.activated && buff) {
          applyBuff(
            buff,
            {
              inputs: ctrl.inputs ?? [],
              fromSelf: false,
            },
            `${name} / 4-Piece activated`
          );
        }
      }
    })();
  }

  applyMainWeaponBuffs(false);
  applyMainArtifactBuffs(false);

  applyArtifactBonuses(true);
  applyWeaponBonuses(true);
  applyMainWeaponBuffs(true);
  applySelfBuffs(true);
  applyMainArtifactBuffs(true);

  const rxnBonuses = GeneralCalc.getRxnBonusesFromEM(totalAttrCtrl.getTotal("em"));

  for (const rxn of TRANSFORMATIVE_REACTIONS) {
    attkBonusesCtrl.add({
      value: rxnBonuses.transformative,
      toType: rxn,
      toKey: "pct_",
      description: "From Elemental Mastery",
    });
  }
  for (const rxn of AMPLIFYING_REACTIONS) {
    attkBonusesCtrl.add({
      value: rxnBonuses.amplifying,
      toType: rxn,
      toKey: "pct_",
      description: "From Elemental Mastery",
    });
  }
  for (const rxn of QUICKEN_REACTIONS) {
    attkBonusesCtrl.add({
      value: rxnBonuses.quicken,
      toType: rxn,
      toKey: "pct_",
      description: "From Elemental Mastery",
    });
  }

  if (reaction === "spread" || infuse_reaction === "spread") {
    attkBonusesCtrl.applySpreadBuff(char.level);
  }
  if (reaction === "aggravate" || infuse_reaction === "aggravate") {
    attkBonusesCtrl.applyAggravateBuff(char.level);
  }

  const totalAttr = totalAttrCtrl.finalize();

  return {
    totalAttr,
    attkBonusesArchive: attkBonusesCtrl.genArchive(),
    artAttr: totalAttrCtrl.finalizeArtifactAttribute(totalAttr),
  };
}
