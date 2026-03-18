import type { ArtifactType, IArtifactGearPieces } from "@/types";
import type { Artifact } from "./Artifact";
import type { Clonable } from "./interfaces";

import { ARTIFACT_TYPES } from "@/constants/global";

export class ArtifactGearPieces<TArtifact extends Artifact>
  extends Map<ArtifactType, TArtifact>
  implements IArtifactGearPieces<TArtifact>, Clonable<ArtifactGearPieces<TArtifact>>
{
  constructor(
    pieces: Partial<Record<ArtifactType, TArtifact>> | Map<ArtifactType, TArtifact> = {}
  ) {
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

  list(): TArtifact[] {
    return Array.from(this.values());
  }

  clone(): ArtifactGearPieces<TArtifact> {
    return new ArtifactGearPieces(this);
  }

  deepClone(): ArtifactGearPieces<TArtifact> {
    const pieces: Partial<Record<ArtifactType, TArtifact>> = {};

    for (const type of ARTIFACT_TYPES) {
      pieces[type] = this.get(type)?.clone() as TArtifact | undefined;
    }

    return new ArtifactGearPieces(pieces);
  }
}
