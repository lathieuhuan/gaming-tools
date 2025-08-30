import type { ModifierCtrl, Teammate } from "@/types";
import type { GenshinModifierViewProps } from "../GenshinModifierView";

export type GetModifierHanldersArgs<T extends ModifierCtrl = ModifierCtrl> = {
  ctrl: T;
  ctrlIndex: number;
  ctrls: T[];
};

export type GetTeammateModifierHanldersArgs = GetModifierHanldersArgs & {
  teammate: Teammate;
  teammateIndex: number;
};

export type ModifierHanlders = Pick<
  GenshinModifierViewProps,
  "onToggle" | "onChangeText" | "onSelectOption" | "onToggleCheck"
>;
