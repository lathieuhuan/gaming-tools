import type { AppArtifact, ArtifactSubStat, ArtifactType, IArtifact } from "@/types";

import { Artifact, ArtifactConstructInfo } from "@/models/base";
import { ArtifactGear } from "@/models/base";
import { $AppArtifact } from "@/services";

export type UpdateData = Partial<Pick<IArtifact, "level" | "mainStatType">> & {
  subStat?: Partial<ArtifactSubStat> & {
    index: number;
  };
};

export class MainArtifactGear extends ArtifactGear {
  setPiece(
    artifact: ArtifactConstructInfo,
    data: AppArtifact = $AppArtifact.getSet(artifact.code)!,
    shouldKeepStats = false
  ) {
    const oldPiece = this.pieces[artifact.type];
    let newPiece: ArtifactConstructInfo;

    if (shouldKeepStats && oldPiece) {
      newPiece = {
        ...oldPiece,
        code: artifact.code,
        rarity: artifact.rarity,
        ID: Date.now(),
      };
    } else {
      newPiece = {
        ...artifact,
        ID: Date.now(),
      };
    }

    this.pieces[artifact.type] = new Artifact(newPiece, data);

    return new MainArtifactGear(this.pieces);
  }

  update(type: ArtifactType, info: UpdateData) {
    const piece = this.pieces[type];

    if (!piece) {
      return this;
    }

    const newSubStats = [...piece.subStats];
    const { subStat, ...newInfo } = info;

    if (subStat) {
      const { index, ...newSubStat } = subStat;

      newSubStats[index] = {
        ...newSubStats[index],
        ...newSubStat,
      };
    }

    this.pieces[type] = new Artifact({ ...piece, ...newInfo, subStats: newSubStats }, piece.data);

    return new MainArtifactGear(this.pieces);
  }

  remove(type: ArtifactType) {
    this.pieces[type] = undefined;

    return new MainArtifactGear(this.pieces);
  }

  clone() {
    const pieces = Array.from(this.pieces).map<Artifact>(
      (piece) =>
        new Artifact(
          {
            ...piece,
            subStats: piece.subStats.map((subStat) => ({ ...subStat })),
          },
          piece.data
        )
    );

    return new MainArtifactGear(pieces);
  }
}
