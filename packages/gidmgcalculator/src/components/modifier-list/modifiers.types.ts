import type { ModifierCtrl, Teammate } from "@Src/types";
import type { GiModifierViewProps } from "../GiModifierView";

export type GetModifierHanldersArgs = {
  ctrl: ModifierCtrl;
  ctrlIndex: number;
  ctrls: ModifierCtrl[];
};

export type GetTeammateModifierHanldersArgs = GetModifierHanldersArgs & {
  teammate: Teammate;
  teammateIndex: number;
};

export type ModifierHanlders = Pick<
  GiModifierViewProps,
  "onToggle" | "onChangeText" | "onSelectOption" | "onToggleCheck"
>;
