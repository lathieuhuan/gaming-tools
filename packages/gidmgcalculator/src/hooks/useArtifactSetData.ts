import type { AppArtifact } from "@/types";
import { $AppArtifact } from "@/services";
import { useRef } from "react";

export function useArtifactSetData() {
  const setData = useRef<Record<number, AppArtifact>>({});

  const get = (code: number) => {
    if (!setData.current[code]) {
      setData.current[code] = $AppArtifact.getSet(code)!;
    }
    return setData.current[code];
  };

  return { get };
}
