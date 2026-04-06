import type { ArtifactType } from "@/types";
import type { Artifact } from "./Artifact";
import type { Clonable } from "./interfaces";

import { ARTIFACT_TYPES } from "@/constants/global";

export class ArtifactGearPieces
  extends Map<ArtifactType, Artifact>
  implements Clonable<ArtifactGearPieces>
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

  list(): Artifact[] {
    return Array.from(this.values());
  }

  clone(): ArtifactGearPieces {
    return new ArtifactGearPieces(this);
  }

  deepClone(): ArtifactGearPieces {
    const pieces: Partial<Record<ArtifactType, Artifact>> = {};

    for (const type of ARTIFACT_TYPES) {
      pieces[type] = this.get(type)?.clone();
    }

    return new ArtifactGearPieces(pieces);
  }
}
