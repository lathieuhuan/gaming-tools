import type { PartiallyOptional, PartiallyRequiredOnly } from "rond";

import type { TrackerControl } from "@/calculation/TrackerControl";
import type {
  AttackElement,
  AttackPattern,
  AttributeStat,
  ReactionType,
} from "@/calculation/types";
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
  SetupAppEntities,
  Target,
  TeamBuffCtrl,
  Teammates,
  Weapon,
} from "@/types";

import { CharacterCalc, GeneralCalc } from "@/calculation/utils";
import { CalcTeamData } from "@/calculation/CalcTeamData";
import {
  AMPLIFYING_REACTIONS,
  LUNAR_TYPES,
  QUICKEN_REACTIONS,
  RESONANCE_STAT,
  TRANSFORMATIVE_REACTIONS,
} from "@/calculation/constants";
import Array_ from "@/utils/Array";
import { AppliedBonusesGetter } from "./AppliedBonusesGetter";
import { AttackBonusesControl } from "./AttackBonusesControl";
import { ResistReductionControl } from "./ResistReductionControl";
import { TotalAttributeControl } from "./TotalAttributeControl";

// This class and its calculation should NOT use any service
// because it is used in SetupOptimizer which is run by Web Worker
export class InputProcessor {
  protected character: Character;
  protected teammates: Teammates;
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
  protected teamBuffCtrls: TeamBuffCtrl[];
  protected reaction?: ElementModCtrl["reaction"];
  protected infuse_reaction?: ElementModCtrl["infuse_reaction"];
  protected superconduct?: ElementModCtrl["superconduct"];
  protected customInfusion: Infusion;

  public teamData: CalcTeamData;
  protected appWeapons: SetupAppEntities["appWeapons"];
  protected appArtifacts: SetupAppEntities["appArtifacts"];
  protected appTeamBuffs: SetupAppEntities["appTeamBuffs"];

  constructor(
    setup: PartiallyRequiredOnly<CalcSetup, "char" | "weapon" | "artifacts">,
    data: PartiallyOptional<SetupAppEntities, "appTeammates" | "appTeamBuffs">,
    protected tracker?: TrackerControl
  ) {
    this.character = setup.char;
    this.weapon = setup.weapon;
    this.artifacts = setup.artifacts;
    this.teammates = setup.party || [];
    this.selfBuffCtrls = setup.selfBuffCtrls || [];
    this.selfDebuffCtrls = setup.selfDebuffCtrls || [];
    this.wpBuffCtrls = setup.wpBuffCtrls || [];
    this.artBuffCtrls = setup.artBuffCtrls || [];
    this.artDebuffCtrls = setup.artDebuffCtrls || [];
    this.teamBuffCtrls = setup.teamBuffCtrls || [];
    this.customBuffCtrls = setup.customBuffCtrls || [];
    this.customDebuffCtrls = setup.customDebuffCtrls || [];
    this.resonances = setup.elmtModCtrls?.resonances || [];
    this.reaction = setup.elmtModCtrls?.reaction;
    this.infuse_reaction = setup.elmtModCtrls?.infuse_reaction;
    this.superconduct = setup.elmtModCtrls?.superconduct;
    this.customInfusion = setup.customInfusion || {
      element: "phys",
    };

    this.teamData = new CalcTeamData(this.character, this.teammates, data.appCharacters);
    this.appWeapons = data.appWeapons;
    this.appArtifacts = data.appArtifacts;
    this.appTeamBuffs = data.appTeamBuffs || [];
  }

  getCalculationStats() {
    const {
      character,
      weapon,
      artifacts,
      teammates,
      selfBuffCtrls,
      wpBuffCtrls,
      artBuffCtrls,
      customBuffCtrls,
      teamBuffCtrls,
      reaction,
      infuse_reaction,
      teamData,
    } = this;
    const { activeAppMember } = teamData;
    const appWeapon = this.appWeapons[weapon.code];

    const { refi } = weapon;
    const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);

    const totalAttrCtrl = new TotalAttributeControl(this.tracker).construct(
      character,
      activeAppMember,
      weapon,
      appWeapon,
      artifacts
    );
    const attkBonusesCtrl = new AttackBonusesControl();
    const bonusesGetter = new AppliedBonusesGetter(teamData, totalAttrCtrl);

    const applyBuff: AppliedBonusesGetter["getAppliedBonuses"] = (...args) => {
      const result = bonusesGetter.getAppliedBonuses(...args);
      totalAttrCtrl.applyBonuses(result.attrBonuses);
      attkBonusesCtrl.add(result.attkBonuses);
      return result;
    };

    const applySelfBuffs = (isFinal: boolean) => {
      const { innateBuffs = [], buffs = [] } = activeAppMember;

      for (const buff of innateBuffs) {
        if (CharacterCalc.isGrantedEffect(buff.grantedAt, character)) {
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

        if (ctrl.activated && buff && CharacterCalc.isGrantedEffect(buff.grantedAt, character)) {
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
            refi,
            fromSelf: true,
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
            attkBonusesCtrl.add({
              value,
              toType: type as ReactionType,
              toKey: subType,
              description: "Custom buff",
            });
          }
          break;
        }
      }
    }

    // APPLY RESONANCE BONUSES
    for (const { vision: elementType, activated, inputs = [] } of this.resonances) {
      if (activated) {
        const { key, value } = RESONANCE_STAT[elementType];
        let xtraValue = 0;
        const description = `${elementType} resonance`;

        if (elementType === "dendro") {
          if (inputs[0]) xtraValue += 20;
          if (inputs[1]) xtraValue += 30;
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

    // APPLY TEAM BUFFS
    for (const ctrl of teamBuffCtrls) {
      const buff = this.appTeamBuffs.find((buff) => buff.id === ctrl.id);

      if (ctrl.activated && buff) {
        applyBuff(
          buff,
          {
            inputs: ctrl.inputs ?? [],
            fromSelf: false,
          },
          `Team Bonus / ${buff.id}`
        );
      }
    }

    // APPLY TEAMMATE BUFFS
    for (const teammate of teammates) {
      if (!teammate) continue;
      const { name, buffs = [] } = teamData.getAppMember(teammate.name);

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
                refi,
                fromSelf: false,
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
    for (const rxn of LUNAR_TYPES) {
      attkBonusesCtrl.add({
        value: rxnBonuses.lunar,
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

  getResistances(target: Target) {
    const {
      teammates,
      customDebuffCtrls,
      selfDebuffCtrls,
      artDebuffCtrls,
      resonances,
      superconduct,
    } = this;
    const { teamData } = this;

    const resistReductCtrl = new ResistReductionControl(teamData, this.tracker);

    // APPLY CUSTOM DEBUFFS
    for (const control of customDebuffCtrls) {
      resistReductCtrl.add(control.type, control.value, "Custom Debuff");
    }

    // APPLY SELF DEBUFFS
    for (const ctrl of selfDebuffCtrls) {
      const debuff = Array_.findByIndex(teamData.activeAppMember.debuffs, ctrl.index);

      if (
        ctrl.activated &&
        debuff?.effects &&
        CharacterCalc.isGrantedEffect(debuff.grantedAt, teamData.activeMember)
      ) {
        resistReductCtrl.applyDebuff(debuff, ctrl.inputs ?? [], true, `Self / ${debuff.src}`);
      }
    }

    // APPLY TEAMMATE DEBUFFS
    for (const teammate of teammates) {
      if (!teammate) continue;
      const { debuffs = [] } = teamData.getAppMember(teammate.name);

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
        resistReductCtrl.applyDebuff(
          debuff,
          ctrl.inputs ?? [],
          false,
          `${name} / 4-piece activated`
        );
      }
    }

    // APPLY RESONANCE & ELEMENT DEBUFFS
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
