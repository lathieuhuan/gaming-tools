import type { IModifierCtrlBasic, ITeammate } from "@/types";
import type { GenshinModifierViewProps } from "../GenshinModifierView";
import { CalcTeammate } from "@/models/calculator";

// TODO remove
// export type GetModifierHanldersArgs<T extends IModifierCtrlBasic = IModifierCtrlBasic> = {
//   ctrl: T;
// };

// export type GetTeammateModifierHanldersArgs = GetModifierHanldersArgs & {
//   teammate: CalcTeammate;
// };

export type ModifierHanlders = Pick<
  GenshinModifierViewProps,
  "onToggle" | "onChangeText" | "onSelectOption" | "onToggleCheck"
>;
