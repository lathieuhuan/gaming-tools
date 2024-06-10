import type {
  AppCharacter,
  AppWeapon,
  AttackElement,
  AttackPattern,
  AttributeStat,
  ReactionType,
} from "@Src/backend/types";
import type {
  CalcArtifacts,
  CalcCharacter,
  CalcWeapon,
  CustomBuffCtrl,
  ElementModCtrl,
  Infusion,
  ModifierCtrl,
  Party,
  PartyData,
} from "@Src/types";

import { AMPLIFYING_REACTIONS, QUICKEN_REACTIONS, TRANSFORMATIVE_REACTIONS } from "@Src/backend/constants";
import { ECalcStatModule, RESONANCE_STAT } from "@Src/backend/constants/internal";

import { $AppArtifact, $AppCharacter, $AppWeapon } from "@Src/services";
import { findByIndex } from "@Src/utils";
import { EntityCalc, GeneralCalc } from "@Src/backend/utils";
import { AttackBonusControl, TotalAttributeControl, TrackerControl } from "@Src/backend/controls";
import { CalcBuffApplier } from "@Src/backend/appliers";

type GetCalculationStatsArgs = {
  char: CalcCharacter;
  appChar: AppCharacter;
  weapon: CalcWeapon;
  appWeapon: AppWeapon;
  artifacts: CalcArtifacts;
  party?: Party;
  partyData?: PartyData;
  elmtModCtrls?: ElementModCtrl;
  selfBuffCtrls?: ModifierCtrl[];
  wpBuffCtrls?: ModifierCtrl[];
  artBuffCtrls?: ModifierCtrl[];
  customBuffCtrls?: CustomBuffCtrl[];
  customInfusion?: Infusion;
  tracker?: TrackerControl;
};

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

  const buffApplier = new CalcBuffApplier(
    {
      char,
      appChar,
      partyData,
    },
    totalAttr,
    attBonus
  );

  const APPLY_SELF_BUFFS = (isFinal: boolean) => {
    const { innateBuffs = [], buffs = [] } = appChar;
    const inputs: number[] = [];

    for (const buff of innateBuffs) {
      if (EntityCalc.isGrantedEffect(buff, char)) {
        buffApplier.applyCharacterBuff({
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
        buffApplier.applyCharacterBuff({
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
      buffApplier.applyWeaponBuff({
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
          buffApplier.applyArtifactBuff({
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

        buffApplier.applyCharacterBuff({
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
            buffApplier.applyWeaponBuff({
              description: `${name} activated`,
              buff,
              inputs: ctrl.inputs ?? [],
              refi,
              fromSelf: false,
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
            buffApplier.applyArtifactBuff({
              description: `${name} / 4-Piece activated`,
              buff,
              inputs: ctrl.inputs ?? [],
              fromSelf: false,
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
        buffApplier.applyWeaponBuff({
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
        buffApplier.applyArtifactBuff({
          description: `${mainArtifactData.name} (self) / 4-piece activated`,
          buff,
          inputs: ctrl.inputs ?? [],
          isFinal,
          fromSelf: true,
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
