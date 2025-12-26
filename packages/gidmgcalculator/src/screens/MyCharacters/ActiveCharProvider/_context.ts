import { createContext } from "react";

import type { Artifact, CalcCharacter } from "@/models/base";
import type { IArtifactGearSlot } from "@/types";

export const ActiveCharContext = createContext<CalcCharacter | null>(null);

export type ActiveCharAction = {
  requestSwitchCharacter: () => void;
  requestSwitchWeapon: () => void;
  requestSwitchArtifact: (slot: IArtifactGearSlot<Artifact>) => void;
  requestRemoveCharacter: () => void;
};

export const ActiveCharActionContext = createContext<ActiveCharAction | null>(null);
