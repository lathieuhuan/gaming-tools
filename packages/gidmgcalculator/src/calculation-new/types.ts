import {
  AttributeStat,
  BaseAttributeStat,
  WeaponType,
  Level,
  ArtifactType,
} from "@/calculation/types";
import { ArtifactSubStat } from "@/types";

export interface IWeapon {
  ID: number;
  type: WeaponType;
  code: number;
  level: Level;
  refi: number;
}

export interface IArtifact {
  ID: number;
  code: number;
  type: ArtifactType;
  rarity: number;
  level: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];
}

export type BareBonus = {
  // id?: string;
  value: number;
  isUnstable?: boolean;
};

export type AttributeBonus = BareBonus & {
  toStat: AttributeStat | BaseAttributeStat;
  description: string;
};
