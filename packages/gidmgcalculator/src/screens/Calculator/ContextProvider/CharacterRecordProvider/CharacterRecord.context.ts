import { createContext } from "react";
import { UICharacterRecord } from "@Src/utils/ui-character-record";

export const CharacterRecordContext = createContext<UICharacterRecord | undefined>(undefined);
