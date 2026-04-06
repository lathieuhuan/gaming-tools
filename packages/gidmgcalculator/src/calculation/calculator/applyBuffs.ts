import { Array_ } from "ron-utils";

import type { CalcSetup, Character, TeammateCalc } from "@/models";
import type {
  AttackElement,
  AttackPattern,
  AttributeStat,
  AttributeTargetPath,
  BareBonus,
  BonusPerformTools,
  EntityBonus,
  EntityBonusEffect,
  EntityBuff,
  ReactionType,
} from "@/types";
import type { IEffectPerformer } from "../types";

import {
  AMPLIFYING_REACTIONS,
  ELEMENT_TYPES,
  LUNAR_TYPES,
  QUICKEN_REACTIONS,
  TRANSFORMATIVE_REACTIONS,
} from "@/constants/global";
import { BonusCalc } from "@/models/Character";
import { QUICKEN_BUFF_LABEL } from "../constants";
import { getRxnBonusesFromEM } from "../core/getRxnBonusesFromEM";

export function applyBuffs(main: Character, teammates: TeammateCalc[], setup: CalcSetup) {
  const { team } = setup;
  const { weapon, allAttrsCtrl, attkBonusCtrl } = main;

  // ↓↓↓↓↓ HELPERS ↓↓↓↓↓

  function processBonus(
    bonus: BareBonus,
    effect: EntityBonus<EntityBonusEffect>,
    inputs: number[] = [],
    label: string
  ) {
    if (!bonus.value) return;

    const { outsource } = bonus.config;

    if (outsource) {
      bonus.value *= new BonusCalc(main, team, { inputs }).getStackValue(outsource.stacks);
    }

    const getToStat = (path: AttributeTargetPath, inpIndex: number) => {
      switch (path) {
        case "INP_ELMT": {
          const elmtIndex = inputs[inpIndex] ?? 0;
          return ELEMENT_TYPES[elmtIndex];
        }
        case "P/H/E/C": {
          return team.getPhecElmt();
        }
        default:
          return path;
      }
    };

    for (const target of Array_.toArray(effect.targets)) {
      switch (target.module) {
        case "ATTR": {
          for (const targetPath of Array_.toArray(target.path)) {
            const toStat = getToStat(targetPath, target.inpIndex ?? 0);
            if (!toStat) continue;

            main.receiveAttrBonus({
              ...bonus,
              toStat,
              label,
              effectSrc: effect,
            });
          }
          break;
        }
        default:
          for (const module of Array_.toArray(target.module)) {
            main.receiveAttkBonus({
              // id: bonus.id,
              toType: module,
              toKey: target.path,
              value: bonus.value,
              label,
              effectSrc: effect,
            });
          }
      }
    }
  }

  function applyBonus(
    label: string,
    performer: IEffectPerformer,
    effects: EntityBuff["effects"] = [],
    support: Omit<Partial<BonusPerformTools>, "basedOnFixed">,
    isFinalStage?: boolean
  ) {
    for (const config of Array_.toArray(effects)) {
      // console.log("===========");
      // console.log("applyBonus", config);
      // console.log(
      //   isFinalStage === undefined,
      //   isFinalStage === isFinalEffect(config),
      //   performer.isPerformableEffect(config, support.inputs)
      // );

      if (
        (isFinalStage === undefined || isFinalStage === isFinalEffect(config)) &&
        team.isAvailableEffect(config) &&
        performer.canPerformEffect(config, support.inputs)
      ) {
        const { targets } = config;
        const basedOnFixed = !Array.isArray(targets) && targets.module === "ATTR";

        const bonus = performer.performBonus(config, {
          ...support,
          basedOnFixed,
        });

        // console.log("===========");
        // console.log("bonus", bonus);

        processBonus(bonus, config, support.inputs, label);
      }
    }
  }

  function applyAbilityBuffs(isFinalStage: boolean) {
    const { innateBuffs = [] } = main.data;

    for (const buff of innateBuffs) {
      if (team.isAvailableEffect(buff) && main.canPerformEffect(buff)) {
        applyBonus(`Self / ${buff.src}`, main, buff.effects, {}, isFinalStage);
      }
    }

    for (const ctrl of setup.selfBuffCtrls) {
      const buff = ctrl.data;

      if (ctrl.activated && team.isAvailableEffect(buff) && main.canPerformEffect(buff)) {
        applyBonus(`Self / ${buff.src}`, main, buff.effects, { inputs: ctrl.inputs }, isFinalStage);
      }
    }
  }

  function applyWeaponBonuses(isFinalStage: boolean) {
    const label = `${weapon.data.name} bonus`;

    applyBonus(label, main, weapon.data.bonuses, { refi: weapon.refi }, isFinalStage);
  }

  function applyArtifactBonuses(isFinalStage: boolean) {
    const { atfGear } = main;

    for (const { bonusLv, pieceCount, data } of atfGear.sets) {
      for (let i = 0; i <= bonusLv; i++) {
        const label = `${data.name} / ${pieceCount}-piece bonus`;
        const effects = data.setBonuses?.[i]?.effects;

        applyBonus(label, main, effects, {}, isFinalStage);
      }
    }
  }

  function applyWeaponBuffs(isFinalStage: boolean) {
    const label = `${weapon.data.name} activated`;

    for (const ctrl of setup.wpBuffCtrls) {
      if (ctrl.activated) {
        const { effects } = ctrl.data;
        applyBonus(label, main, effects, { inputs: ctrl.inputs, refi: weapon.refi }, isFinalStage);
      }
    }
  }

  function applyArtifactBuffs(isFinalStage: boolean) {
    for (const ctrl of setup.artBuffCtrls) {
      if (ctrl.activated) {
        const { bonusLv = 1 } = ctrl.data;
        const label = `${ctrl.setData.name} (self) / ${bonusLv * 2 + 2}-piece bonus`;

        applyBonus(label, main, ctrl.data.effects, { inputs: ctrl.inputs }, isFinalStage);
      }
    }
  }

  // ↓↓↓↓↓ MAIN PROCESS ↓↓↓↓↓

  applyAbilityBuffs(false);
  applyWeaponBonuses(false);
  applyArtifactBonuses(false);

  // APPLY CUSTOM BUFFS
  for (const { category, type, subType, value } of setup.customBuffCtrls) {
    switch (category) {
      case "totalAttr":
        allAttrsCtrl.applyBonus({
          value,
          toStat: type as AttributeStat,
          label: "Custom buff",
        });
        break;
      case "attElmtBonus": {
        if (subType === "pct_") {
          allAttrsCtrl.applyBonus({
            value,
            toStat: type as AttributeStat,
            label: "Custom buff",
          });
        } else if (subType) {
          attkBonusCtrl.add({
            value,
            toType: type as AttackElement,
            toKey: subType,
            label: "Custom buff",
          });
        }
        break;
      }
      case "attPattBonus": {
        if (subType) {
          attkBonusCtrl.add({
            value,
            toType: type as AttackPattern | "all",
            toKey: subType,
            label: "Custom buff",
          });
        }
        break;
      }
      case "rxnBonus": {
        if (subType) {
          attkBonusCtrl.add({
            value,
            toType: type as ReactionType,
            toKey: subType,
            label: "Custom buff",
          });
        }
        break;
      }
    }
  }

  // APPLY RESONANCE BONUSES
  for (const { element, activated, inputs = [] } of setup.rsnBuffCtrls) {
    if (!activated) {
      continue;
    }

    switch (element) {
      case "geo":
        attkBonusCtrl.add({
          value: 15,
          toType: "all",
          toKey: "pct_",
          label: "Geo resonance / Shielded",
        });
        break;
      case "cryo":
        allAttrsCtrl.applyBonus({
          value: 15,
          toStat: "cRate_",
          label: "Cryo resonance",
        });
        break;
      case "dendro":
        allAttrsCtrl.applyBonus({
          value: (inputs[0] ? 20 : 0) + (inputs[1] ? 30 : 0),
          toStat: "em",
          label: "Dendro resonance / Trigger Dendro reactions",
        });
        break;
      default:
        break;
    }
  }

  // APPLY TEAM BUFFS
  for (const ctrl of setup.teamBuffCtrls) {
    if (ctrl.activated) {
      const buff = ctrl.data;
      applyBonus(`Team Bonus / ${buff.src}`, main, buff.effects, { inputs: ctrl.inputs });
    }
  }

  // APPLY TEAMMATE BUFFS
  for (const teammate of teammates) {
    //
    for (const ctrl of teammate.buffCtrls) {
      if (
        ctrl.activated &&
        team.isAvailableEffect(ctrl.data) &&
        teammate.canPerformEffect(ctrl.data)
      ) {
        const buff = ctrl.data;
        const label = `${teammate.data.name} / ${buff.src}`;
        applyBonus(label, teammate, buff.effects, { inputs: ctrl.inputs });
      }
    }

    {
      const { buffCtrls, refi, data } = teammate.weapon;
      const label = `${data.name} activated`;

      for (const ctrl of buffCtrls) {
        if (ctrl.activated) {
          applyBonus(label, teammate, ctrl.data.effects, { inputs: ctrl.inputs, refi });
        }
      }
    }

    if (teammate.artifact) {
      const { buffCtrls, data } = teammate.artifact;
      const label = `${data.name} / 4-Piece activated`;

      for (const ctrl of buffCtrls) {
        if (ctrl.activated) {
          applyBonus(label, teammate, ctrl.data.effects, { inputs: ctrl.inputs });
        }
      }
    }
  }

  applyWeaponBuffs(false);
  applyArtifactBuffs(false);

  applyArtifactBonuses(true);
  applyWeaponBonuses(true);
  applyWeaponBuffs(true);
  applyAbilityBuffs(true);
  applyArtifactBuffs(true);

  allAttrsCtrl.finalize();

  const rxnBonuses = getRxnBonusesFromEM(main.getAttr("em"));

  if (rxnBonuses.transformative) {
    for (const rxn of TRANSFORMATIVE_REACTIONS) {
      attkBonusCtrl.add({
        value: rxnBonuses.transformative,
        toType: rxn,
        toKey: "pct_",
        label: "From Elemental Mastery",
      });
    }
  }

  if (rxnBonuses.lunar) {
    for (const rxn of LUNAR_TYPES) {
      attkBonusCtrl.add({
        value: rxnBonuses.lunar,
        toType: rxn,
        toKey: "pct_",
        label: "From Elemental Mastery",
      });
    }
  }

  if (rxnBonuses.amplifying) {
    for (const rxn of AMPLIFYING_REACTIONS) {
      attkBonusCtrl.add({
        value: rxnBonuses.amplifying,
        toType: rxn,
        toKey: "pct_",
        label: "From Elemental Mastery",
      });
    }
  }

  if (rxnBonuses.quicken) {
    for (const rxn of QUICKEN_REACTIONS) {
      attkBonusCtrl.add({
        value: rxnBonuses.quicken,
        toType: rxn,
        toKey: "pct_",
        label: "From Elemental Mastery",
      });
    }
  }

  const { reaction, infuseReaction } = setup.elmtEvent;

  if (reaction === "spread" || infuseReaction === "spread") {
    attkBonusCtrl.add({
      value: main.getQuickenBuffDamage("spread"),
      toType: "dendro",
      toKey: "flat",
      label: QUICKEN_BUFF_LABEL.spread,
    });
  }
  if (reaction === "aggravate" || infuseReaction === "aggravate") {
    attkBonusCtrl.add({
      value: main.getQuickenBuffDamage("aggravate"),
      toType: "electro",
      toKey: "flat",
      label: QUICKEN_BUFF_LABEL.aggravate,
    });
  }
}

function isFinal(effect: EntityBonusEffect) {
  const { basedOn } = effect;

  if (basedOn) {
    const field = typeof basedOn === "string" ? basedOn : basedOn.field;
    return field !== "base_atk";
  }
  return false;
}

function isFinalEffect(bonus: EntityBonusEffect) {
  return (
    isFinal(bonus) ||
    (typeof bonus.preExtra === "object" && isFinal(bonus.preExtra)) ||
    (typeof bonus.sufExtra === "object" && isFinal(bonus.sufExtra))
  );
}
