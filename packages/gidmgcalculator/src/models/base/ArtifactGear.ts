import type {
  ArtifactType,
  IArtifact,
  IArtifactGear,
  IArtifactGearPieces,
  IArtifactGearSet,
  IArtifactGearSlot,
  TotalAttributes,
} from "@/types";
import type { Artifact } from "./Artifact";

import { ARTIFACT_TYPES, CORE_STAT_TYPES } from "@/constants";
import { applyPercent } from "@/utils/pure-utils";
import TypeCounter from "@/utils/TypeCounter";

class PiecesIterator<TArtifact extends IArtifact> implements Iterator<TArtifact> {
  private index = 0;

  constructor(private pieces: IArtifactGearPieces<TArtifact>) {}

  private getNextPiece(): TArtifact | undefined {
    const type = ARTIFACT_TYPES.at(this.index);

    if (!type) {
      return undefined;
    }

    this.index++;

    return this.pieces[type] || this.getNextPiece();
  }

  next(): IteratorResult<TArtifact, undefined> {
    const value = this.getNextPiece();
    return value ? { value, done: false } : { value: undefined, done: true };
  }
}

export class ArtifactGearPieces<TArtifact extends IArtifact>
  implements IArtifactGearPieces<TArtifact>
{
  flower?: TArtifact;
  plume?: TArtifact;
  sands?: TArtifact;
  goblet?: TArtifact;
  circlet?: TArtifact;

  constructor(pieces?: Partial<Record<ArtifactType, TArtifact>>) {
    this.flower = pieces?.flower;
    this.plume = pieces?.plume;
    this.sands = pieces?.sands;
    this.goblet = pieces?.goblet;
    this.circlet = pieces?.circlet;
  }

  [Symbol.iterator](): Iterator<TArtifact> {
    return new PiecesIterator(this);
  }

  forEach(callback: (piece: TArtifact, index: number) => void): void {
    for (let index = 0; index < ARTIFACT_TYPES.length; index++) {
      const type = ARTIFACT_TYPES[index];

      if (this[type]) {
        callback(this[type], index);
      }
    }
  }

  map<U>(callback: (piece: TArtifact, index: number) => U): U[] {
    const result: U[] = [];

    this.forEach((piece, index) => {
      result.push(callback(piece, index));
    });

    return result;
  }
}

type ArtifactGearSlot<TArtifact extends Artifact = Artifact> =
  | {
      isFilled: true;
      type: ArtifactType;
      piece: TArtifact;
    }
  | {
      isFilled: false;
      type: ArtifactType;
    };

export class ArtifactGear<TArtifact extends Artifact = Artifact>
  implements IArtifactGear<TArtifact>
{
  pieces: ArtifactGearPieces<TArtifact>;
  slots: IArtifactGearSlot<TArtifact>[] = [];
  sets: IArtifactGearSet[] = [];
  attributes: TotalAttributes = new TypeCounter();
  finalAttrs: TotalAttributes = new TypeCounter();

  constructor(pieces?: IArtifactGearPieces<TArtifact> | TArtifact[]) {
    const gearPieces: Partial<Record<ArtifactType, TArtifact>> = {};
    const slots: ArtifactGearSlot<TArtifact>[] = [];

    const getPiece = Array.isArray(pieces)
      ? (type: ArtifactType) => pieces.find((piece) => piece.type === type)
      : (type: ArtifactType) => pieces?.[type];

    for (const type of ARTIFACT_TYPES) {
      const piece = getPiece(type);

      gearPieces[type] = piece;

      slots.push(piece ? { isFilled: true, type, piece } : { isFilled: false, type });
    }

    this.pieces = new ArtifactGearPieces(gearPieces);
    this.slots = slots;

    if (!pieces) {
      return;
    }

    const sets: IArtifactGearSet[] = [];
    const attributes: TotalAttributes = new TypeCounter();
    const counter = new TypeCounter();

    for (const artifact of pieces) {
      const codeCount = counter.add(artifact.code);

      if (codeCount === 2) {
        sets.push({
          bonusLv: 0,
          pieceCount: 2,
          data: artifact.data,
        });
      } else if (codeCount === 4) {
        sets[0].bonusLv = 1;
        sets[0].pieceCount = 4;
      }

      attributes.add(artifact.mainStatType, artifact.mainStatValue);

      artifact.subStats.forEach((subStat) => {
        attributes.add(subStat.type, subStat.value);
      });
    }

    this.sets = sets;
    this.attributes = attributes;
  }

  finalizeAttributes = (baseStats: { hp_base: number; atk_base: number; def_base: number }) => {
    const counter = this.attributes.clone();

    for (const statType of CORE_STAT_TYPES) {
      const percentValue = counter.get(`${statType}_`);

      if (percentValue) {
        const finalValue = applyPercent(baseStats[`${statType}_base`], percentValue);

        counter.add(statType, finalValue);
      }

      counter.delete(`${statType}_`);
    }

    this.finalAttrs = counter;
  };
}
