import { createContext, useContext } from "react";

import type { EnkaImportSection } from "../_types";

export type LayoutContextState = {
  isMobile: boolean;
  goToSection: (section: EnkaImportSection) => void;
};

export const LayoutContext = createContext<LayoutContextState | null>(null);

export function useLayoutState() {
  const context = useContext(LayoutContext);

  if (!context) {
    throw new Error("useLayoutState must be used within a LayoutProvider");
  }

  return context;
}
