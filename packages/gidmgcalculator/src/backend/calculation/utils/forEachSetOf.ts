import { ArtifactType } from "@Src/backend/types";
import { Artifact, CalcArtifacts } from "@Src/types";

export function forEachSetOf(artifacts: Artifact[]) {
  const artifactMap = new Map<ArtifactType, Set<Artifact | null>>();

  function get(type: ArtifactType, initial?: (Artifact | null)[]) {
    return artifactMap.get(type) || new Set(initial);
  }

  for (const artifact of artifacts) {
    artifactMap.set(artifact.type, get(artifact.type).add(artifact));
  }

  return {
    do: (cb: (set: CalcArtifacts) => void) => {
      for (const flower of get("flower", [null])) {
        for (const plume of get("plume", [null])) {
          for (const sands of get("sands", [null])) {
            for (const goblet of get("goblet", [null])) {
              for (const circlet of get("circlet", [null])) {
                cb([flower, plume, sands, goblet, circlet]);
              }
            }
          }
        }
      }
    },
  };
}
