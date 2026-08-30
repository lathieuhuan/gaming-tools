import { Array_ } from "ron-utils";

import { Weapon, type CalcSetup, type Character, type Teammate } from "@/models";
import type {
  AttackElement,
  AttackPattern,
  AttributeStat,
  AttributeTargetPath,
  BareBonus,
  BonusCoreSpec,
  BonusPerformTools,
  BonusSpec,
  BuffSpec,
  ReactionType,
  TeamMember,
} from "@/types";

import {
  AMPLIFYING_REACTIONS,
  ELEMENT_TYPES,
  LUNAR_TYPES,
  QUICKEN_REACTIONS,
  STELLAR_TYPES,
  TRANSFORMATIVE_REACTIONS,
} from "@/constants/global";
import { BonusCalc } from "@/models/Character";
import { getRxnBonusesFromEM } from "../core/getRxnBonusesFromEM";

type ApplyBuffsOptions = {
  resonatedElmts?: AttackElement[];
};

export function applyBuffs(
  main: Character,
  teammates: Teammate[],
  setup: CalcSetup,
  options: ApplyBuffsOptions = {},
) {
  const { team } = setup;
  const { weapon, attrCtrl, attkBonusCtrl } = main;
  const { resonatedElmts = [] } = options;

  // POLYSTAR FIELD BONUSES
  const { polestarProc = false, polestarCount = 0 } = setup.elmtEvent;

  if (polestarProc) {
    const label = "Polestar Field";
    const bonus = 20 + (polestarCount ? 8 : 0) + polestarCount * 1;

    attrCtrl.addBonus({
      value: bonus,
      toStat: "cryo",
      label,
    });
    attrCtrl.addBonus({
      value: bonus,
      toStat: "electro",
      label,
    });
  }

  // ↓↓↓↓↓ HELPERS ↓↓↓↓↓

  function processBonus(bonus: BareBonus, spec: BonusSpec, inputs: number[] = [], label: string) {
    if (!bonus.value) return;

    const { outsource, target } = spec;

    if (outsource) {
      const stacks = new BonusCalc(main, team, { inputs }).getStacks(outsource.stacks);

      bonus.value *= stacks?.value ?? 1;
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

    switch (target.module) {
      case "ATTR": {
        for (const targetPath of Array_.toArray(target.path)) {
          const toStat = getToStat(targetPath, target.inpIndex ?? 0);
          if (!toStat) continue;

          main.receiveAttrBonus({
            ...bonus,
            toStat,
            label,
            effectSrc: spec,
          });
        }
        break;
      }
      case "TLT": {
        if (!spec.id) return;

        main.levelBonuses.set(spec.id, {
          id: spec.id,
          talent: target.path,
          value: bonus.value,
        });
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
            effectSrc: spec,
          });
        }
    }
  }

  function applyBonus(
    label: string,
    performer: TeamMember,
    specs: BuffSpec["effects"] = [],
    support: Omit<Partial<BonusPerformTools>, "basedOnStatic">,
    isFinalStage?: boolean,
  ) {
    for (const spec of Array_.toArray(specs)) {
      if (
        (isFinalStage === undefined || isFinalStage === isFinalEffect(spec)) &&
        team.isAvailableEffect(spec) &&
        performer.canPerformEffect(spec, support.inputs)
      ) {
        const { target } = spec;
        const basedOnStatic = target.module === "ATTR";

        const bonus = performer.performBonus(spec, {
          ...support,
          basedOnStatic,
        });

        // console.log("===========");
        // console.log("bonus", bonus);

        processBonus(bonus, spec, support.inputs, label);
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

  if (main.isTraveler && weapon.code === Weapon.TRAVELER_SWORD_CODE && weapon.refi > 1) {
    applyBonus(
      `${weapon.data.name} bonus`,
      main,
      {
        value: 6 * resonatedElmts.length,
        incre: 0,
        target: { module: "ATTR", path: "cDmg_" },
      },
      { refi: weapon.refi },
      false,
    );
  }

  applyArtifactBonuses(false);

  // APPLY CUSTOM BUFFS
  for (const { category, type, subType, value } of setup.customBuffCtrls) {
    switch (category) {
      case "totalAttr":
        attrCtrl.addBonus({
          value,
          toStat: type as AttributeStat,
          label: "Custom buff",
        });
        break;
      case "attElmtBonus": {
        if (subType === "pct_") {
          attrCtrl.addBonus({
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
        attkBonusCtrl.add({
          value: 15,
          toType: "all",
          toKey: "cRate_",
          label: "Cryo resonance",
        });
        break;
      case "dendro":
        attrCtrl.addBonus({
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

  attrCtrl.finalize();

  const em = main.getAttr("em");

  if (em) {
    const rxnBonuses = getRxnBonusesFromEM(em);

    for (const rxn of TRANSFORMATIVE_REACTIONS) {
      attkBonusCtrl.add({
        value: rxnBonuses.transformative,
        toType: rxn,
        toKey: "pct_",
        label: "From Elemental Mastery",
      });
    }

    for (const rxn of LUNAR_TYPES) {
      attkBonusCtrl.add({
        value: rxnBonuses.lunar,
        toType: rxn,
        toKey: "pct_",
        label: "From Elemental Mastery",
      });
    }

    for (const rxn of STELLAR_TYPES) {
      attkBonusCtrl.add({
        value: rxnBonuses.stellar,
        toType: rxn,
        toKey: "pct_",
        label: "From Elemental Mastery",
      });
    }

    for (const rxn of AMPLIFYING_REACTIONS) {
      attkBonusCtrl.add({
        value: rxnBonuses.amplifying,
        toType: rxn,
        toKey: "pct_",
        label: "From Elemental Mastery",
      });
    }

    for (const rxn of QUICKEN_REACTIONS) {
      attkBonusCtrl.add({
        value: rxnBonuses.quicken,
        toType: rxn,
        toKey: "pct_",
        label: "From Elemental Mastery",
      });
    }
  }
}

function isFinal(effect: BonusCoreSpec) {
  const { basedOn } = effect;

  if (basedOn) {
    const field = typeof basedOn === "string" ? basedOn : basedOn.field;
    return field !== "base_atk";
  }
  return false;
}

function isFinalEffect(bonus: BonusCoreSpec) {
  return (
    isFinal(bonus) ||
    (typeof bonus.preExtra === "object" && isFinal(bonus.preExtra)) ||
    (typeof bonus.extras === "object" && Array_.toArray(bonus.extras).some(isFinal))
  );
}
