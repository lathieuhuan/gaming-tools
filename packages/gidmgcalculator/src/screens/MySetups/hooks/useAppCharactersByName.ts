import { useRef } from "react";
import { $AppCharacter } from "@Src/services";
import type { AppCharactersByName } from "@Src/types";

export function useAppCharactersByName() {
  const appCharactersByName = useRef<AppCharactersByName>({});

  return {
    data: appCharactersByName.current,
    register: (name: string) => {
      if (!appCharactersByName.current[name]) {
        appCharactersByName.current[name] = $AppCharacter.get(name);
      }
    },
  };
}
