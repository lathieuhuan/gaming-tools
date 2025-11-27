import { ReactNode } from "react";

export type ModifierContainerProps = {
  type: "buffs" | "debuffs";
  mutable?: boolean;
  children: ReactNode;
};

export function ModifierContainer({ type, mutable, children }: ModifierContainerProps) {
  return (
    <div data-slot="modifier-container">
      <div className={`peer pt-2 ${mutable ? "space-y-3" : "space-y-2"}`}>{children}</div>
      <p className="py-4 text-center text-light-hint hidden peer-empty:block">
        No {type} found
      </p>
    </div>
  );
}
