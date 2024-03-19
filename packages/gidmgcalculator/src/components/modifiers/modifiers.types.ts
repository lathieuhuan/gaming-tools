import type { ModifierCtrl, Teammate } from "@Src/types";
import type { ModifierItemProps } from "../ModifierItem";

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
  ModifierItemProps,
  "onToggle" | "onChangeText" | "onSelectOption" | "onToggleCheck"
>;
