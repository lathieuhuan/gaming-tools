import type { AppArtifact, IArtifact } from "@/types";
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

  const getSlot = (piece: IArtifact) => {
    const data = get(piece.code);
    const { name, icon } = data[piece.type];
    return { beta: data.beta, name, icon, data };
  };

  return { get, getSlot };
}
