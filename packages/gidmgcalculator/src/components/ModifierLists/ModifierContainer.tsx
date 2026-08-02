import type { ReactNode } from "react";
import { EmptyFallback } from "rond";

export type ModifierContainerProps = {
  type: "buffs" | "debuffs";
  mutable?: boolean;
  children: ReactNode;
};

export function ModifierContainer({ type, mutable, children }: ModifierContainerProps) {
  return (
    <EmptyFallback
      className={`pt-2 ${mutable ? "space-y-3" : "space-y-2"}`}
      message={`No ${type} found`}
    >
      {children}
    </EmptyFallback>
  );
}
