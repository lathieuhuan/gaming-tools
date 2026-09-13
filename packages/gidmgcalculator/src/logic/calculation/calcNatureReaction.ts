import type { Character } from "@/models/Character";
import type { Target } from "@/models/Target";
import type {
  ActualAttackElement,
  ElementalEvent,
  NatureReaction,
  StandaloneReaction,
} from "@/types";
import type { NatureCalcReactionOutputs } from "./types";

import { calcReaction } from "./calcReaction";
import {
  LUNAR_REACTION_ELEMENTS,
  NATURE_LUNAR_REACTION_COEFFICIENTS,
  TRANSFORMATIVE_REACTION_COEFFICIENTS,
  TRANSFORMATIVE_REACTION_ELEMENTS,
} from "./constants";

export function calcNatureReaction(
  performer: Character,
  target: Target,
  reaction: NatureReaction,
  elmtEvent: ElementalEvent,
): NatureCalcReactionOutputs {
  let coefficient = 1;
  let attElmt: ActualAttackElement;
  let extraCRate = performer.getAttr("cRate_");
  let extraCDmg = performer.getAttr("cDmg_");

  switch (reaction) {
    case "lunarCharged":
    case "lunarCryst": {
      coefficient = NATURE_LUNAR_REACTION_COEFFICIENTS[reaction];
      attElmt = LUNAR_REACTION_ELEMENTS[reaction];
      break;
    }
    case "stellarSwirl":
      coefficient = 0.75;
      attElmt = "anemo";
      break;
    case "stellarVortex":
      coefficient = elmtEvent.vortexLv === 3 ? 3 : 2;
      attElmt = "cryo";
      break;
    default: {
      coefficient = TRANSFORMATIVE_REACTION_COEFFICIENTS[reaction];
      attElmt = TRANSFORMATIVE_REACTION_ELEMENTS[reaction];
      // Transformatives cannot crit by default
      extraCRate = 0;
      extraCDmg = 0;
    }
  }

  // Stellar Vortex is actually an elemental event. It deals Stellar Swirl DMG.
  const standaloneReaction: StandaloneReaction =
    reaction === "stellarVortex" ? "stellarSwirl" : reaction;

  const { baseReactionDMG } = performer;

  const outputs = calcReaction(
    performer,
    target,
    [baseReactionDMG],
    coefficient,
    standaloneReaction,
    attElmt,
    {
      absorption: elmtEvent.absorption,
      absorbReaction: elmtEvent.absorbReaction,
      extraCRate,
      extraCDmg,
    },
  );

  return {
    ...outputs,
    subType: "nature",
  };
}
