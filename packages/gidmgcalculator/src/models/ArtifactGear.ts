import { applyPercent, CountMap } from "ron-utils";

import type { AllAttributes, ArtifactGearSet, ArtifactType } from "@/types";

import { ARTIFACT_TYPES, CORE_STAT_TYPES } from "@/constants/global";
import { Artifact } from "./Artifact";

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

type ArtifactGearPieces = Record<ArtifactType, Artifact | undefined>;

export class ArtifactGear {
  private constructor(
    public pieces: ArtifactGearPieces,
    public sets: ArtifactGearSet[],
    public attributes: AllAttributes,
    public finalAttrs: AllAttributes,
  ) {}

  deepClone() {
    const pieces: ArtifactGearPieces = {
      flower: undefined,
      plume: undefined,
      sands: undefined,
      goblet: undefined,
      circlet: undefined,
    };

    for (const type of ARTIFACT_TYPES) {
      pieces[type] = this.pieces[type]?.clone();
    }

    return new ArtifactGear(pieces, this.sets, this.attributes, this.finalAttrs);
  }

  /** No order */
  list(): Artifact[] {
    return Object.values(this.pieces).filter((piece) => piece !== undefined);
  }

  /** Order: Flower, Plume, Sands, Goblet, Circlet */
  slots<U>(callback: (slot: ArtifactGearSlot) => U): U[];
  slots(): ArtifactGearSlot[];
  slots<U>(callback?: (slot: ArtifactGearSlot) => U): ArtifactGearSlot[] | U[] {
    if (callback) {
      return this.slots().map(callback);
    }

    return ARTIFACT_TYPES.map((type) => {
      const piece = this.pieces[type];

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

  // ===== STATIC =====

  static create(init?: Partial<ArtifactGearPieces> | (Artifact | null | undefined)[]) {
    const pieces: ArtifactGearPieces = {
      flower: undefined,
      plume: undefined,
      sands: undefined,
      goblet: undefined,
      circlet: undefined,
    };
    const sets: ArtifactGearSet[] = [];
    const attributes: AllAttributes = new CountMap();
    const counter = new CountMap<number>();

    const getPiece = Array.isArray(init)
      ? (type: ArtifactType) => init.find((piece) => piece?.type === type)
      : (type: ArtifactType) => init?.[type];

    for (const type of ARTIFACT_TYPES) {
      const piece = getPiece(type);
      if (!piece) continue;

      pieces[type] = piece;

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

    return new ArtifactGear(pieces, sets, attributes, new CountMap());
  }
}
