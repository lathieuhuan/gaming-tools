import type { PartiallyRequiredOnly } from "rond";
import type {
  ArtifactModCtrl,
  CalcArtifacts,
  CalcSetup,
  Character,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementModCtrl,
  Infusion,
  ModifierCtrl,
  Party,
  SetupEntitiesData,
  Target,
  Weapon,
} from "@Src/types";
import type { AttackElement, AttackPattern, AttributeStat, ReactionType } from "@Src/backend/types";

import Array_ from "@Src/utils/array-utils";
import { CharacterCalc, CharacterData, GeneralCalc } from "@Src/backend/common-utils";
import {
  AMPLIFYING_REACTIONS,
  QUICKEN_REACTIONS,
  RESONANCE_STAT,
  TRANSFORMATIVE_REACTIONS,
} from "@Src/backend/constants";
import { AppliedBonusesGetter } from "./bonus-getters";
import {
  AttackBonusesControl,
  ResistanceReductionControl,
  TotalAttributeControl,
  TrackerControl,
} from "./stat-controls";
import { AttackAlterer } from "./attack-alterer";

// This class and its calculation should NOT use any service
// because it is used in SetupOptimizer which is run by Web Worker
export class InputProcessor {
  protected character: Character;
  protected party: Party;
  protected weapon: Weapon;
  protected artifacts: CalcArtifacts;
  protected selfBuffCtrls: ModifierCtrl[];
  protected selfDebuffCtrls: ModifierCtrl[];
  protected wpBuffCtrls: ModifierCtrl[];
  protected artBuffCtrls: ArtifactModCtrl[];
  protected artDebuffCtrls: ArtifactModCtrl[];
  protected customBuffCtrls: CustomBuffCtrl[];
  protected customDebuffCtrls: CustomDebuffCtrl[];

  protected resonances: ElementModCtrl["resonances"];
  protected reaction?: ElementModCtrl["reaction"];
  protected infuse_reaction?: ElementModCtrl["infuse_reaction"];
  protected superconduct?: ElementModCtrl["superconduct"];
  protected customInfusion: Infusion;

  public characterData: CharacterData;
  protected appWeapons: SetupEntitiesData["appWeapons"];
  protected appArtifacts: SetupEntitiesData["appArtifacts"];

  constructor(
    setup: PartiallyRequiredOnly<CalcSetup, "char" | "weapon" | "artifacts">,
    data: SetupEntitiesData,
    protected tracker?: TrackerControl
  ) {
    this.character = setup.char;
    this.weapon = setup.weapon;
    this.artifacts = setup.artifacts;
    this.party = setup.party || [];
    this.selfBuffCtrls = setup.selfBuffCtrls || [];
    this.selfDebuffCtrls = setup.selfDebuffCtrls || [];
    this.wpBuffCtrls = setup.wpBuffCtrls || [];
    this.artBuffCtrls = setup.artBuffCtrls || [];
    this.artDebuffCtrls = setup.artDebuffCtrls || [];
    this.customBuffCtrls = setup.customBuffCtrls || [];
    this.customDebuffCtrls = setup.customDebuffCtrls || [];
    this.resonances = setup.elmtModCtrls?.resonances || [];
    this.reaction = setup.elmtModCtrls?.reaction;
    this.infuse_reaction = setup.elmtModCtrls?.infuse_reaction;
    this.superconduct = setup.elmtModCtrls?.superconduct;
    this.customInfusion = setup.customInfusion || {
      element: "phys",
    };

    this.characterData = new CharacterData(this.character, data.appCharacters, this.party);
    this.appWeapons = data.appWeapons;
    this.appArtifacts = data.appArtifacts;
  }

  getCalculationStats() {
    const {
      character,
      weapon,
      artifacts,
      party,
      selfBuffCtrls,
      wpBuffCtrls,
      artBuffCtrls,
      customBuffCtrls,
      resonances,
      reaction,
      infuse_reaction,
      characterData,
    } = this;
    const { appCharacter } = characterData;
    const appWeapon = this.appWeapons[weapon.code];

    const { refi } = weapon;
    const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);

    const totalAttrCtrl = new TotalAttributeControl(this.tracker).construct(
      character,
      appCharacter,
      weapon,
      appWeapon,
      artifacts
    );
    const attkBonusesCtrl = new AttackBonusesControl();
    const bonusesGetter = new AppliedBonusesGetter(characterData, totalAttrCtrl);

    const applyBuff: AppliedBonusesGetter["getAppliedBonuses"] = (...args) => {
      const result = bonusesGetter.getAppliedBonuses(...args);
      totalAttrCtrl.applyBonuses(result.attrBonuses);
      attkBonusesCtrl.add(result.attkBonuses);
      return result;
    };

    const applySelfBuffs = (isFinal: boolean) => {
      const { innateBuffs = [], buffs = [] } = appCharacter;

      for (const buff of innateBuffs) {
        if (CharacterCalc.isGrantedEffect(buff, character)) {
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

        if (ctrl.activated && buff && CharacterCalc.isGrantedEffect(buff, character)) {
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
          const data = this.appArtifacts[code];
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
          const { name, buffs = [] } = this.appArtifacts[ctrl.code] || {};
          const buff = Array_.findByIndex(buffs, ctrl.index);

          if (buff) {
            applyBuff(
              buff,
              {
                inputs: ctrl.inputs ?? [],
                fromSelf: true,
              },
              `${name} (self) / ${(buff.bonusLv ?? 1) * 2 + 2}-piece bonus`,
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
      const { name, buffs = [] } = characterData.getAppCharacter(teammate.name);

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
        const { name, buffs = [] } = this.appWeapons[code] || {};

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
        const { name, buffs = [] } = this.appArtifacts[code] || {};

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
      attkBonusesCtrl.applySpreadBuff(character.level);
    }
    if (reaction === "aggravate" || infuse_reaction === "aggravate") {
      attkBonusesCtrl.applyAggravateBuff(character.level);
    }

    const totalAttr = totalAttrCtrl.finalize();

    return {
      totalAttr,
      attkBonusesArchive: attkBonusesCtrl.genArchive(),
      artAttr: totalAttrCtrl.finalizeArtifactAttribute(totalAttr),
    };
  }

  getAttackAlterer() {
    return new AttackAlterer(this.characterData, this.selfBuffCtrls);
  }

  getResistances(target: Target) {
    const { party, customDebuffCtrls, selfDebuffCtrls, artDebuffCtrls, resonances, superconduct } = this;
    const { characterData } = this;

    const resistReductCtrl = new ResistanceReductionControl(characterData, this.tracker);

    // APPLY CUSTOM DEBUFFS
    for (const control of customDebuffCtrls) {
      resistReductCtrl.add(control.type, control.value, "Custom Debuff");
    }

    // APPLY SELF DEBUFFS
    for (const ctrl of selfDebuffCtrls) {
      const debuff = Array_.findByIndex(characterData.appCharacter.debuffs, ctrl.index);

      if (ctrl.activated && debuff?.effects && CharacterCalc.isGrantedEffect(debuff, characterData.character)) {
        resistReductCtrl.applyDebuff(debuff, ctrl.inputs ?? [], true, `Self / ${debuff.src}`);
      }
    }

    // APPLY PARTY DEBUFFS
    for (const teammate of party) {
      if (!teammate) continue;
      const { debuffs = [] } = characterData.getAppCharacter(teammate.name);

      for (const ctrl of teammate.debuffCtrls) {
        const debuff = Array_.findByIndex(debuffs, ctrl.index);

        if (ctrl.activated && debuff?.effects) {
          resistReductCtrl.applyDebuff(debuff, ctrl.inputs ?? [], false, `Self / ${debuff.src}`);
        }
      }
    }

    // APPLY ARTIFACT DEBUFFS
    for (const ctrl of artDebuffCtrls) {
      const { name, debuffs = [] } = this.appArtifacts[ctrl.code] || {};
      const debuff = debuffs[ctrl.index];

      if (ctrl.activated && debuff?.effects) {
        resistReductCtrl.applyDebuff(debuff, ctrl.inputs ?? [], false, `${name} / 4-piece activated`);
      }
    }

    // APPLY RESONANCE DEBUFFS
    const geoRsn = resonances.find((rsn) => rsn.vision === "geo");
    if (geoRsn && geoRsn.activated) {
      resistReductCtrl.add("geo", 20, "Geo resonance");
    }
    if (superconduct) {
      resistReductCtrl.add("phys", 40, "Superconduct");
    }
    return resistReductCtrl.applyTo(target);
  }
}
