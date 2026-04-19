import type { ResistReductionKey } from "../common";
import type { TalentLevelIncrementSpec } from "./common-specs";
import type { EffectConditionSpecs } from "./effect-condition-specs";
import type { EffectValueSpec } from "./effect-value-spec";

export type PenaltyCoreSpec = EffectConditionSpecs & {
  value: EffectValueSpec;

  // ============ CHARACTER PENALTY ONLY ============
  lvIncre?: TalentLevelIncrementSpec;
  /** Added before stacks, after lvIncre */
  preExtra?: number | PenaltyCoreSpec;
  max?: number;
};

export type PenaltyTargetsSpec =
  | ResistReductionKey
  | {
      type: "INP_ELMT";
      /** Input's index to get ElementType index. Default 0 */
      inpIndex?: number;
    }
  | {
      type: "XILONEN";
    };

export type PenaltySpec = PenaltyCoreSpec & {
  targets: "OWN_ELMT" | PenaltyTargetsSpec | PenaltyTargetsSpec[];
};
