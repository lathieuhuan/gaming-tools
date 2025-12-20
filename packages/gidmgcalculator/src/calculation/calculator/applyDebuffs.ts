import type { CalcSetup } from "@/models/calculator";
import type { ElementType, EntityDebuff, EntityPenaltyTarget, ResistReductionKey } from "@/types";
import type { CalcTarget } from "../core/CalcTarget";
import type { CharacterCalc } from "../core/CharacterCalc";
import type { IEffectPerformer } from "../types";
import type { TeammateCalc } from "./TeammateCalc";

import { ELEMENT_TYPES } from "@/constants/global";
import Array_ from "@/utils/Array";

export function applyDebuffs(
  main: CharacterCalc,
  teammates: TeammateCalc[],
  setup: CalcSetup,
  target: CalcTarget
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
          const elmts: ElementType[] = ["pyro", "hydro", "cryo", "electro"];
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
      if (team.isAvailableEffect(effect) && performer.isPerformableEffect(effect, inputs)) {
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
      main.isPerformableEffect(debuff, ctrl.inputs)
    ) {
      applyPenalty(`Self / ${debuff.src}`, main, ctrl.data.effects, ctrl.inputs);
    }
  }

  // APPLY TEAMMATE DEBUFFS
  for (const teammate of teammates) {
    const { name, debuffs = [] } = teammate.data;

    for (const ctrl of teammate.debuffCtrls) {
      const debuff = Array_.findByIndex(debuffs, ctrl.data.index);

      if (ctrl.activated && debuff && team.isAvailableEffect(debuff)) {
        applyPenalty(`${name} / ${debuff.src}`, teammate, debuff.effects, ctrl.inputs);
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
