import { createContext } from "react";
import type { CharacterReadData } from "@Backend";

export const CharacterDataContext = createContext<CharacterReadData | undefined>(undefined);
