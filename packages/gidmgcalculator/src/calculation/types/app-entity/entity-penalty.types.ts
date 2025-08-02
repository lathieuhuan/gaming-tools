import type { ResistReductionKey } from "../common.types";
import type { CharacterEffectLevelScale } from "./app-entity-common.types";
import type { EffectApplicableCondition } from "./effect-condition.types";
import type { EffectValueByOption } from "./effect-value.types";

export type EntityPenaltyEffect = EffectApplicableCondition & {
  value: number | EffectValueByOption;

  // ============ CHARACTER PENALTY ONLY ============
  lvScale?: CharacterEffectLevelScale;
  /** Added before stacks, after scale */
  preExtra?: number | EntityPenaltyEffect;
  max?: number;
};

export type EntityPenaltyTarget =
  | ResistReductionKey
  | {
      type: "INP_ELMT";
      /** Input's index to get ElementType index. Default to 0 */
      inpIndex?: number;
    }
  | {
      type: "XILONEN";
    };

export type EntityPenalty<TEntityPenaltyCore extends EntityPenaltyEffect> = TEntityPenaltyCore & {
  targets: EntityPenaltyTarget | EntityPenaltyTarget[];
};
