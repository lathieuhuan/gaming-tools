import type { GenshinModifierViewProps } from "../GenshinModifierView";

export type ModifierHanlders = Pick<
  GenshinModifierViewProps,
  "onToggle" | "onChangeText" | "onSelectOption" | "onToggleCheck"
>;
