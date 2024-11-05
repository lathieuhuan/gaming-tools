import type { ResistanceReductionKey } from "../common.types";
import type { CharacterEffectLevelScale } from "./app-entity-common.types";
import type { EffectApplicableCondition } from "./effect-condition.types";

export type EntityPenaltyCore<TPenaltyExtend extends object = object> = TPenaltyExtend &
  EffectApplicableCondition & {
    value: number;

    // ============ CHARACTER PENALTY ONLY ============
    lvScale?: CharacterEffectLevelScale;
    /** Added before stacks, after scale */
    preExtra?: number | EntityPenaltyCore;
    max?: number;
  };

export type EntityPenaltyTarget =
  | ResistanceReductionKey
  | {
      type: "inp_elmt";
      /** Input's index to get ElementType index. Default to 0 */
      inpIndex?: number;
    }
  | {
      type: "XILONEN";
    };

export type EntityPenalty<TEntityPenaltyCore extends EntityPenaltyCore> = TEntityPenaltyCore & {
  targets: EntityPenaltyTarget | EntityPenaltyTarget[];
};
