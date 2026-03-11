import type { ArtifactType, IArtifact, IArtifactGearPieces } from "@/types";
import type { Clonable } from "./interfaces";

import { ARTIFACT_TYPES } from "@/constants/global";

export class ArtifactGearPieces<TArtifact extends IArtifact>
  extends Map<ArtifactType, TArtifact>
  implements IArtifactGearPieces<TArtifact>, Clonable<ArtifactGearPieces<TArtifact>>
{
  constructor(pieces: Partial<Record<ArtifactType, TArtifact>> = {}) {
    super();

    for (const atfType of ARTIFACT_TYPES) {
      const piece = pieces[atfType];

      if (piece) {
        this.set(atfType, piece);
      }
    }
  }

  list(): TArtifact[] {
    return Array.from(this.values());
  }

  clone(): ArtifactGearPieces<TArtifact> {
    return new ArtifactGearPieces(Object.fromEntries(this.entries()));
  }
}
