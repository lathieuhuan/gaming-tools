import type { ElementType, ResistReductionKey } from "../common.types";
import type { CharacterEffectLevelScale } from "./app-entity-common.types";
import type { EffectApplicableCondition } from "./effect-condition.types";

/** Count members of element types of the party. Ex: [Pyro, Pyro] -> 2 */
type MemberOptionIndex = {
  source: "MEMBER";
  element: ElementType | ElementType[];
};

type EntityPenaltyValueByOption = {
  options: number[];
  /** If number, [source] is "INPUT", [inpIndex] is the number. Default to 0 */
  optIndex?: number | MemberOptionIndex;
};

export type EntityPenaltyCore = EffectApplicableCondition & {
  value: number | EntityPenaltyValueByOption;

  // ============ CHARACTER PENALTY ONLY ============
  lvScale?: CharacterEffectLevelScale;
  /** Added before stacks, after scale */
  preExtra?: number | EntityPenaltyCore;
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

export type EntityPenalty<TEntityPenaltyCore extends EntityPenaltyCore> = TEntityPenaltyCore & {
  targets: EntityPenaltyTarget | EntityPenaltyTarget[];
};
