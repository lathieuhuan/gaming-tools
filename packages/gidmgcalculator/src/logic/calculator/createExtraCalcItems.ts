import type { TalentCalcItem, TeamMember } from "@/types";
import type { CalcSetup } from "./CalcSetup";

import { Character, Teammate } from "@/models";

// ===== TEMPORARY SOLUTION =====

function getNicoleEBLevel(nicole: TeamMember): number | undefined {
  if (nicole instanceof Teammate) {
    const ebCtrl = nicole.buffCtrls.find((ctrl) => ctrl.id === 2);

    return ebCtrl?.activated ? ebCtrl.inputs?.at(0) : undefined;
  }

  if (nicole instanceof Character) {
    return nicole.finalTalentLv("EB");
  }

  return undefined;
}

function getNicoleEBFactor(level: number): number | undefined {
  let factor = 90 + level * 9;

  if (level > 10) {
    factor += (level - 10) * 1.8;
  }

  return factor;
}

export function createExtraCalcItems(setup: CalcSetup): TalentCalcItem[] {
  const calcItems: TalentCalcItem[] = [];

  const nicole = setup.team.getMember("Nicole");

  if (!nicole) {
    return [];
  }

  const level = getNicoleEBLevel(nicole);
  const ebFactor = level ? getNicoleEBFactor(level) : undefined;
  const attElmt = setup.main.data.vision;

  if (ebFactor) {
    calcItems.push({
      id: "id.100",
      name: "Arcane Projection (Nicole EB)",
      factor: ebFactor,
      attElmt,
      noU: true,
    });
  }

  calcItems.push({
    name: "Arcane Projection: Unity (Nicole C1)",
    factor: 600,
    attElmt,
    noU: true,
  });

  return calcItems;
}
