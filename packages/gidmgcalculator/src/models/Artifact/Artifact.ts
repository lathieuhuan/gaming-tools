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
  key?: Partial<ArtifactKey>;
  state?: Partial<ArtifactStateData>;
  relation?: Partial<EquipmentRelationData>;
};

export type ArtifactCloneOptions = ArtifactConstructOptions;

@FlatGetters("key", ["ID", "code"])
@FlatGetters("state", ["type", "rarity", "level", "mainStatType", "mainStatValue", "subStats"])
@FlatGetters("relation", ["owner", "setupIDs"])
export class Artifact implements Clonable<Artifact> {
  readonly key: ArtifactKey;
  readonly state: ArtifactState;
  readonly relation: EquipmentRelation;

  readonly data: AppArtifact;

  declare readonly ID: number;
  declare readonly code: number;
  declare readonly type: ArtifactType;
  declare readonly rarity: number;
  declare readonly level: number;
  declare readonly mainStatType: AttributeStat;
  declare readonly mainStatValue: number;
  declare readonly subStats: ArtifactSubStat[];
  declare readonly owner?: number;
  declare readonly setupIDs?: number[];

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

  serialize(): RawArtifact {
    return Artifact.serialize(this);
  }

  /** deep clone */
  clone(options: ArtifactCloneOptions = {}) {
    const key = Object_.patch(this.key, options.key || {});

    return new Artifact(key, this.data, {
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
