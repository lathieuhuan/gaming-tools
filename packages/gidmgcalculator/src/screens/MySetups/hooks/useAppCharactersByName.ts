import { useRef } from "react";
import { $AppCharacter } from "@/services";
import type { AppCharactersByName } from "@/types";

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
