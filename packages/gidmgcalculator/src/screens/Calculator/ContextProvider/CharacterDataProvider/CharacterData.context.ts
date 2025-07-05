import { createContext } from "react";
import type { CharacterReadData } from "@Calculation";

export const CharacterDataContext = createContext<CharacterReadData | undefined>(undefined);
