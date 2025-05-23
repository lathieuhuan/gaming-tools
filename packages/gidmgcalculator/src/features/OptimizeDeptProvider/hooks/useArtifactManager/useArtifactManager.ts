import { useRef } from "react";
import { ArtifactManager } from "./artifact-manager";

export function useArtifactManager(...args: ConstructorParameters<typeof ArtifactManager>) {
  const ref = useRef<ArtifactManager>();

  if (!ref.current) {
    ref.current = new ArtifactManager(...args);
  }
  return ref.current;
}
