import { createContext, useContext } from "react";

import type { EnkaImportSection } from "../types";

export type ContainerContextState = {
  isMobile: boolean;
  goToSection: (section: EnkaImportSection) => void;
};

export const ContainerContext = createContext<ContainerContextState | null>(null);

export function useContainerState() {
  const context = useContext(ContainerContext);

  if (!context) {
    throw new Error("useContainerState must be used within a ContainerProvider");
  }

  return context;
}
