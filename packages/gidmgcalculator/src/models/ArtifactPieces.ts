import type { ArtifactType } from "@/types";
import type { Artifact } from "./Artifact";
import type { Clonable } from "./interfaces";

import { ARTIFACT_TYPES } from "@/constants/global";

export class ArtifactPieces
  extends Map<ArtifactType, Artifact>
  implements Clonable<ArtifactPieces>
{
  constructor(pieces: Partial<Record<ArtifactType, Artifact>> | Map<ArtifactType, Artifact> = {}) {
    super();

    const getPiece =
      pieces instanceof Map
        ? (type: ArtifactType) => pieces.get(type)
        : (type: ArtifactType) => pieces[type];

    for (const atfType of ARTIFACT_TYPES) {
      const piece = getPiece(atfType);

      if (piece) {
        this.set(atfType, piece);
      }
    }
  }

  clone(): ArtifactPieces {
    return new ArtifactPieces(this);
  }
}
