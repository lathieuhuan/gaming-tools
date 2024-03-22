import type { ModifierCtrl, Teammate } from "@Src/types";
import type { GenshinModifierViewProps } from "../GenshinModifierView";

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
  GenshinModifierViewProps,
  "onToggle" | "onChangeText" | "onSelectOption" | "onToggleCheck"
>;
