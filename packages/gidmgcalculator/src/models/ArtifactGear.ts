import { applyPercent } from "ron-utils";

import type {
  AllAttributes,
  ArtifactType,
  IArtifactGear,
  IArtifactGearPieces,
  IArtifactGearSet,
  IArtifactGearSlot,
} from "@/types";
import type { Artifact } from "./Artifact";
import type { Clonable } from "./interfaces";

import { ARTIFACT_TYPES, CORE_STAT_TYPES } from "@/constants/global";
import TypeCounter from "@/utils/TypeCounter";
import { ArtifactGearPieces } from "./ArtifactGearPieces";

export class ArtifactGear<TArtifact extends Artifact = Artifact>
  implements IArtifactGear<TArtifact>, Clonable<ArtifactGear<TArtifact>>
{
  pieces: ArtifactGearPieces<TArtifact>;
  sets: IArtifactGearSet[] = [];
  attributes: AllAttributes = new TypeCounter();
  finalAttrs: AllAttributes = new TypeCounter();

  constructor(pieces?: IArtifactGearPieces<TArtifact> | TArtifact[]) {
    const gearPieces: Partial<Record<ArtifactType, TArtifact>> = {};

    const getPiece = Array.isArray(pieces)
      ? (type: ArtifactType) => pieces.find((piece) => piece.type === type)
      : (type: ArtifactType) => pieces?.get(type);

    for (const type of ARTIFACT_TYPES) {
      const piece = getPiece(type);

      gearPieces[type] = piece;
    }

    this.pieces = new ArtifactGearPieces(gearPieces);

    this.processPieces();
  }

  private processPieces() {
    const sets: IArtifactGearSet[] = [];
    const attributes: AllAttributes = new TypeCounter();
    const counter = new TypeCounter();

    for (const piece of this.pieces.values()) {
      const codeCount = counter.add(piece.code);

      if (codeCount === 2) {
        sets.push({
          bonusLv: 0,
          pieceCount: 2,
          data: piece.data,
        });
      } else if (codeCount === 4) {
        sets[0].bonusLv = 1;
        sets[0].pieceCount = 4;
      }

      attributes.add(piece.mainStatType, piece.mainStatValue);

      piece.subStats.forEach((subStat) => {
        attributes.add(subStat.type, subStat.value);
      });
    }

    this.sets = sets;
    this.attributes = attributes;
  }

  slots<U>(callback: (slot: IArtifactGearSlot<TArtifact>) => U): U[];
  slots(): IArtifactGearSlot<TArtifact>[];
  slots<U>(
    callback?: (slot: IArtifactGearSlot<TArtifact>) => U
  ): IArtifactGearSlot<TArtifact>[] | U[] {
    if (callback) {
      return this.slots().map(callback);
    }

    return ARTIFACT_TYPES.map((type) => {
      const piece = this.pieces.get(type);

      return piece
        ? {
            isFilled: true,
            type,
            piece,
          }
        : { isFilled: false, type };
    });
  }

  finalizeAttributes = (baseStats: { hp_base: number; atk_base: number; def_base: number }) => {
    const attrs = this.attributes.clone();

    for (const statType of CORE_STAT_TYPES) {
      const percentValue = attrs.get(`${statType}_`);

      if (percentValue) {
        const finalValue = applyPercent(baseStats[`${statType}_base`], percentValue);

        attrs.add(statType, finalValue);
      }

      attrs.delete(`${statType}_`);
    }

    return (this.finalAttrs = attrs);
  };

  clone(): ArtifactGear<TArtifact> {
    return new ArtifactGear(this.pieces);
  }
}
