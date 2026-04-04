import { createContext, useContext } from "react";

import type { CharacterCalc } from "@/models";
import type { ArtifactGearSlot } from "@/types";

// Data Context

export const ActiveCharContext = createContext<CharacterCalc | null>(null);

export function useActiveChar() {
  const context = useContext(ActiveCharContext);
  if (!context) {
    throw new Error("useActiveChar must be used inside ActiveCharProvider");
  }
  return context;
}

// Action Context

export type ActiveCharAction = {
  requestSwitchCharacter: () => void;
  requestSwitchWeapon: () => void;
  requestSwitchArtifact: (slot: ArtifactGearSlot) => void;
  requestRemoveCharacter: () => void;
};

export const ActiveCharActionContext = createContext<ActiveCharAction | null>(null);

export function useActiveCharActions() {
  const context = useContext(ActiveCharActionContext);
  if (!context) {
    throw new Error("useActiveCharAction must be used inside ActiveCharProvider");
  }
  return context;
}
