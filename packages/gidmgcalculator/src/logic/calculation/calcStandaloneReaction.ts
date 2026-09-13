import type { Character } from "@/models/Character";
import type { Target } from "@/models/Target";
import type {
  ActualAttackElement,
  ElementalEvent,
  LunarReaction,
  StandaloneReactionType,
  TransformativeReaction,
} from "@/types";
import type { TraditionalCalcReactionOutputs } from "./types";

import { calcReaction } from "./calcReaction";

export function calcStandaloneReaction(
  performer: Character,
  target: Target,
  reaction: StandaloneReactionType,
  elmtEvent: ElementalEvent,
): TraditionalCalcReactionOutputs {
  let coefficient = 1;
  let attElmt: ActualAttackElement;
  let extraCRate = performer.getAttr("cRate_");
  let extraCDmg = performer.getAttr("cDmg_");

  switch (reaction) {
    case "lunarCharged":
    case "lunarCryst": {
      const spec = LUNAR_REACTION_SPECS[reaction];

      coefficient = spec.coef;
      attElmt = spec.attElmt;
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
      const spec = TRANSFORMATIVE_REACTION_SPECS[reaction];

      coefficient = spec.coef;
      attElmt = spec.attElmt;
      // Transformatives cannot crit by default
      extraCRate = 0;
      extraCDmg = 0;
    }
  }

  // Stellar Vortex is actually an elemental event. It deals Stellar Swirl DMG.
  reaction = reaction === "stellarVortex" ? "stellarSwirl" : reaction;

  const { baseReactionDMG } = performer;

  const outputs = calcReaction(performer, target, [baseReactionDMG], attElmt, reaction, {
    coefficient,
    absorption: elmtEvent.absorption,
    absorbReaction: elmtEvent.absorbReaction,
    extraCRate,
    extraCDmg,
  });

  return {
    ...outputs,
    subType: "traditional",
  };
}

type ReactionSpec = {
  coef: number;
  attElmt: ActualAttackElement;
};

const LUNAR_REACTION_SPECS: Record<LunarReaction, ReactionSpec> = {
  lunarCharged: { coef: 1.8, attElmt: "electro" },
  lunarCryst: { coef: 0.96, attElmt: "geo" },
};

const TRANSFORMATIVE_REACTION_SPECS: Record<TransformativeReaction, ReactionSpec> = {
  bloom: { coef: 2, attElmt: "dendro" },
  hyperbloom: { coef: 3, attElmt: "dendro" },
  burgeon: { coef: 3, attElmt: "dendro" },
  burning: { coef: 0.25, attElmt: "pyro" },
  swirl: { coef: 0.6, attElmt: "absorb" },
  superconduct: { coef: 1.5, attElmt: "cryo" },
  electroCharged: { coef: 2, attElmt: "electro" },
  overloaded: { coef: 2.75, attElmt: "pyro" },
  shattered: { coef: 3, attElmt: "phys" },
};
