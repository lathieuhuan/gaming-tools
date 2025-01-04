import { createContext } from "react";

export type DetailModalControl = {
  requestSwitchCharacter: () => void;
  requestSwitchWeapon: () => void;
  requestSwitchArtifact: (index: number) => void;
  requestRemoveCharacter: () => void;
};

export const DetailModalContext = createContext<DetailModalControl | null>(null);
