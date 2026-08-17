import { applyPercent, CountMap } from "ron-utils";

import type { AllAttributes, ArtifactGearSet, ArtifactType } from "@/types";
import type { Clonable } from "./interfaces";

import { ARTIFACT_TYPES, CORE_STAT_TYPES } from "@/constants/global";
import { Artifact } from "./Artifact";
import { ArtifactPieces } from "./ArtifactPieces";

export type ArtifactGearSlot =
  | {
      isFilled: true;
      type: ArtifactType;
      piece: Artifact;
    }
  | {
      isFilled: false;
      type: ArtifactType;
    };

export class ArtifactGear implements Clonable<ArtifactGear> {
  pieces: ArtifactPieces;
  sets: ArtifactGearSet[] = [];
  attributes: AllAttributes = new CountMap();
  finalAttrs: AllAttributes = new CountMap();

  constructor(pieces?: ArtifactPieces | Artifact[]) {
    const gearPieces: Partial<Record<ArtifactType, Artifact>> = {};

    const getPiece = Array.isArray(pieces)
      ? (type: ArtifactType) => pieces.find((piece) => piece.type === type)
      : (type: ArtifactType) => pieces?.get(type);

    for (const type of ARTIFACT_TYPES) {
      const piece = getPiece(type);

      gearPieces[type] = piece;
    }

    this.pieces = new ArtifactPieces(gearPieces);

    this.processPieces();
  }

  private processPieces() {
    const sets: ArtifactGearSet[] = [];
    const attributes: AllAttributes = new CountMap();
    const counter = new CountMap<number>();

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

  /** No order */
  list(): Artifact[] {
    return Array.from(this.pieces.values());
  }

  /** Order: Flower, Plume, Sands, Goblet, Circlet */
  slots<U>(callback: (slot: ArtifactGearSlot) => U): U[];
  slots(): ArtifactGearSlot[];
  slots<U>(callback?: (slot: ArtifactGearSlot) => U): ArtifactGearSlot[] | U[] {
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

  clone() {
    return new ArtifactGear(this.pieces);
  }

  deepClone() {
    const pieces = new ArtifactPieces();

    this.pieces.forEach((piece, type) => {
      pieces.set(type, piece.clone());
    });

    return new ArtifactGear(pieces);
  }
}
