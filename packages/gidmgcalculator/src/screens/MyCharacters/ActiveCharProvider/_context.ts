import { createContext, useContext } from "react";

import type { Artifact, CharacterCalc } from "@/models";
import type { IArtifactGearSlot } from "@/types";

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
  requestSwitchArtifact: (slot: IArtifactGearSlot<Artifact>) => void;
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
