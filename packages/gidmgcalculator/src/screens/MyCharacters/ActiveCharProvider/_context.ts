import { createContext } from "react";

import type { Artifact } from "@/models/base";
import type { CharacterCalc } from "@/models/calculation";
import type { IArtifactGearSlot } from "@/types";

export const ActiveCharContext = createContext<CharacterCalc | null>(null);

export type ActiveCharAction = {
  requestSwitchCharacter: () => void;
  requestSwitchWeapon: () => void;
  requestSwitchArtifact: (slot: IArtifactGearSlot<Artifact>) => void;
  requestRemoveCharacter: () => void;
};

export const ActiveCharActionContext = createContext<ActiveCharAction | null>(null);
