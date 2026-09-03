import { Array_ } from "ron-utils";

import type { Character, Teammate } from "@/models";
import type { DebuffSpec, ElementType, PenaltyTargetsSpec, ResistReductionKey } from "@/types";
import type { CalcSetup } from "../CalcSetup";

import { ELEMENT_TYPES, PHEC_ELEMENT_TYPES } from "@/constants/global";

export function applyDebuffs(setup: CalcSetup) {
  const { main, teammates, team, target } = setup;

  target.initCalculation();

  // ↓↓↓↓↓ HELPERS ↓↓↓↓↓

  function getReductionPaths(targets: PenaltyTargetsSpec[], inputs: number[]) {
    const paths = new Set<ResistReductionKey>();

    for (const target of targets) {
      if (typeof target === "string") {
        paths.add(target);
        continue;
      }

      switch (target.type) {
        case "INP_ELMT": {
          const { inpIndex = 0 } = target;
          const elmtIndex = inputs[inpIndex ?? 0];
          paths.add(ELEMENT_TYPES[elmtIndex]);
          break;
        }
        case "XILONEN": {
          const elmts: ElementType[] = [...PHEC_ELEMENT_TYPES];
          const { elmtCount } = team;

          elmtCount.forEach((_, elmt) => {
            if (elmts.includes(elmt)) paths.add(elmt);
          });

          if (elmtCount.get(elmts) < 3) {
            paths.add("geo");
          }
          break;
        }
      }
    }

    return paths;
  }

  function applyPenalty(
    label: string,
    performer: Character | Teammate,
    effects: DebuffSpec["effects"] = [],
    inputs: number[] = [],
  ) {
    const memberOps = team.member(performer);

    for (const effect of Array_.toArray(effects)) {
      if (memberOps.canPerformEffect(effect, inputs)) {
        const targets: PenaltyTargetsSpec[] =
          effect.targets === "OWN_ELMT" ? [main.data.vision] : Array_.toArray(effect.targets);

        const reductionPaths = getReductionPaths(targets, inputs);
        const penalty = memberOps.penaltyCalc(inputs).getInitialValue(effect);

        reductionPaths.forEach((path) => target.takeResistReduction(path, penalty, label));
      }
    }
  }

  // ↓↓↓↓↓ MAIN PROCESS ↓↓↓↓↓

  // APPLY CUSTOM DEBUFFS
  for (const control of setup.customDebuffCtrls) {
    target.takeResistReduction(control.type, control.value, "Custom Debuff");
  }

  // APPLY SELF DEBUFFS
  for (const ctrl of setup.selfDebuffCtrls) {
    const { data: debuff, inputs } = ctrl;

    if (ctrl.activated && team.member(main).canPerformEffect(debuff, inputs)) {
      applyPenalty(`Self / ${debuff.src}`, main, debuff.effects, inputs);
    }
  }

  // APPLY TEAMMATE DEBUFFS
  for (const teammate of teammates) {
    //
    for (const ctrl of teammate.debuffCtrls) {
      const { data: debuff, inputs } = ctrl;

      if (ctrl.activated && team.member(teammate).canPerformEffect(debuff, inputs)) {
        const label = `${teammate.data.name} / ${debuff.src}`;
        applyPenalty(label, teammate, debuff.effects, inputs);
      }
    }
  }

  // APPLY ARTIFACT DEBUFFS
  for (const ctrl of setup.artDebuffCtrls) {
    if (ctrl.activated) {
      const label = `${ctrl.setData.name} / 4-piece activated`;

      applyPenalty(label, main, ctrl.data.effects, ctrl.inputs);
    }
  }

  // APPLY RESONANCE & ELEMENT DEBUFFS
  const geoDebuffCtrl = setup.rsnDebuffCtrls.find((ctrl) => ctrl.element === "geo");

  if (geoDebuffCtrl?.activated) {
    target.takeResistReduction("geo", 20, "Geo resonance / Hit by Shielded");
  }
  if (setup.elmtEvent.superconduct) {
    target.takeResistReduction("phys", 40, "Superconduct");
  }

  target.finalizeCalculation();
}
