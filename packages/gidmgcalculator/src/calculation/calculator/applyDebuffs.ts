import { Array_ } from "ron-utils";

import type { CalcSetup, Character, TargetCalc, TeammateCalc } from "@/models";
import type { ElementType, EntityDebuff, EntityPenaltyTarget, ResistReductionKey } from "@/types";
import type { IEffectPerformer } from "../types";

import { ELEMENT_TYPES, PHEC_ELEMENT_TYPES } from "@/constants/global";

export function applyDebuffs(
  main: Character,
  teammates: TeammateCalc[],
  setup: CalcSetup,
  target: TargetCalc
) {
  const { team } = setup;

  // ↓↓↓↓↓ HELPERS ↓↓↓↓↓

  function getReductionPaths(targets: EntityPenaltyTarget[], inputs: number[]) {
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

          elmtCount.forEach((elmt) => {
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
    performer: IEffectPerformer,
    effects: EntityDebuff["effects"] = [],
    inputs: number[] = []
  ) {
    for (const effect of Array_.toArray(effects)) {
      if (team.isAvailableEffect(effect) && performer.canPerformEffect(effect, inputs)) {
        const penalty = performer.performPenalty(effect, inputs);
        const reductionPaths = getReductionPaths(Array_.toArray(effect.targets), inputs);

        reductionPaths.forEach((path) => target.takeReduction(path, penalty, label));
      }
    }
  }

  // ↓↓↓↓↓ MAIN PROCESS ↓↓↓↓↓

  // APPLY CUSTOM DEBUFFS
  for (const control of setup.customDebuffCtrls) {
    target.takeReduction(control.type, control.value, "Custom Debuff");
  }

  // APPLY SELF DEBUFFS
  for (const ctrl of setup.selfDebuffCtrls) {
    const debuff = ctrl.data;

    if (
      ctrl.activated &&
      team.isAvailableEffect(debuff) &&
      main.canPerformEffect(debuff, ctrl.inputs)
    ) {
      applyPenalty(`Self / ${debuff.src}`, main, ctrl.data.effects, ctrl.inputs);
    }
  }

  // APPLY TEAMMATE DEBUFFS
  for (const teammate of teammates) {
    //
    for (const ctrl of teammate.debuffCtrls) {
      if (ctrl.activated && team.isAvailableEffect(ctrl.data)) {
        const debuff = ctrl.data;
        const label = `${teammate.data.name} / ${debuff.src}`;
        applyPenalty(label, teammate, debuff.effects, ctrl.inputs);
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
    target.takeReduction("geo", 20, "Geo resonance / Hit by Shielded");
  }
  if (setup.elmtEvent.superconduct) {
    target.takeReduction("phys", 40, "Superconduct");
  }

  target.finalize();
}
