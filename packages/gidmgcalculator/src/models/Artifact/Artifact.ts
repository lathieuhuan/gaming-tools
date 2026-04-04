import { Object_ } from "ron-utils";

import type {
  AppArtifact,
  RawArtifact,
  ArtifactKey,
  ArtifactStateData,
  ArtifactSubStat,
  ArtifactType,
  AttributeStat,
  EquipmentRelationData,
} from "@/types";
import type { Clonable } from "../interfaces";

import { FlatGetters } from "@/decorators/FlatGetters.decorator";
import { EquipmentRelation } from "../EquipmentRelation";
import { ArtifactState } from "./ArtifactState";

export type ArtifactConstructOptions = {
  state?: Partial<ArtifactStateData>;
  relation?: Partial<EquipmentRelationData>;
};

@FlatGetters("key", ["ID", "code"])
@FlatGetters("state", ["type", "rarity", "level", "mainStatType", "mainStatValue", "subStats"])
@FlatGetters("relation", ["owner", "setupIDs"])
export class Artifact implements Clonable<Artifact> {
  key: ArtifactKey;
  state: ArtifactState;
  relation: EquipmentRelation;

  readonly data: AppArtifact;

  declare ID: number;
  declare code: number;
  declare type: ArtifactType;
  declare rarity: number;
  declare level: number;
  declare mainStatType: AttributeStat;
  declare mainStatValue: number;
  declare subStats: ArtifactSubStat[];
  declare owner?: number;
  declare setupIDs?: number[];

  get icon() {
    return this.data[this.type].icon;
  }

  constructor(key: ArtifactKey, data: AppArtifact, options: ArtifactConstructOptions = {}) {
    this.key = {
      ID: key.ID,
      code: key.code,
    };
    this.state = new ArtifactState(options.state);
    this.relation = new EquipmentRelation(options.relation);
    this.data = data;
  }

  extractCore() {
    return Artifact.extractCore({
      ...this.key,
      ...this.state,
    });
  }

  serialize(): RawArtifact {
    return Artifact.serialize(this);
  }

  clone(options: ArtifactConstructOptions = {}) {
    return new Artifact(this.key, this.data, {
      state: {
        ...this.state,
        ...options.state,
      },
      relation: {
        ...this.relation,
        ...options.relation,
      },
    });
  }

  // ===== STATIC =====

  static serialize(artifact: RawArtifact): RawArtifact {
    return Object_.patch<RawArtifact>(
      {
        ID: artifact.ID,
        code: artifact.code,
        type: artifact.type,
        rarity: artifact.rarity,
        level: artifact.level,
        mainStatType: artifact.mainStatType,
        subStats: artifact.subStats,
      },
      {
        owner: artifact.owner,
        setupIDs: artifact.setupIDs,
      }
    );
  }

  static extractCore(artifact: RawArtifact): ArtifactKey & ArtifactStateData {
    return Object_.extract(artifact, [
      "ID",
      "code",
      "type",
      "rarity",
      "level",
      "mainStatType",
      "subStats",
    ]);
  }

  static iconOf(artifactType: ArtifactType) {
    return ARTIFACT_TYPE_ICONS.find((item) => item.value === artifactType)?.icon;
  }

  static allIcons(): ArtifactTypeIcon[];
  static allIcons<T>(transform: (icons: ArtifactTypeIcon) => T): T[];
  static allIcons<T>(transform?: (icons: ArtifactTypeIcon) => T): ArtifactTypeIcon[] | T[] {
    return transform ? ARTIFACT_TYPE_ICONS.map(transform) : ARTIFACT_TYPE_ICONS;
  }
}

type ArtifactTypeIcon = { value: ArtifactType; icon: string };

const ARTIFACT_TYPE_ICONS: ArtifactTypeIcon[] = [
  { value: "flower", icon: "2/2d/Icon_Flower_of_Life" },
  { value: "plume", icon: "8/8b/Icon_Plume_of_Death" },
  { value: "sands", icon: "9/9f/Icon_Sands_of_Eon" },
  { value: "goblet", icon: "3/37/Icon_Goblet_of_Eonothem" },
  { value: "circlet", icon: "6/64/Icon_Circlet_of_Logos" },
];
