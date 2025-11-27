import type { ResistReductionKey } from "../common";
import type { CharacterEffectLevelScale } from "./app-entity-common";
import type { EffectCondition } from "./effect-condition";
import type { EffectValue } from "./effect-value";

export type EntityPenaltyEffect = EffectCondition & {
  value: EffectValue;

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
      /** Input's index to get ElementType index. Default 0 */
      inpIndex?: number;
    }
  | {
      type: "XILONEN";
    };

export type EntityPenalty<TEntityPenaltyCore extends EntityPenaltyEffect> = TEntityPenaltyCore & {
  targets: EntityPenaltyTarget | EntityPenaltyTarget[];
};
