import { Object_ } from "ron-utils";

import type {
  AppArtifact,
  ArtifactSubStat,
  ArtifactType,
  AttributeStat,
  EquipmentRelationData,
  RawArtifact,
} from "@/types";
import type { Clonable } from "./interfaces";

type ArtifactCreateOptions = Partial<
  Pick<
    RawArtifact,
    "type" | "rarity" | "level" | "mainStatType" | "subStats" | "owner" | "setupIDs"
  >
>;

export type ArtifactCloneOptions = Partial<
  Pick<
    RawArtifact,
    "ID" | "type" | "rarity" | "level" | "mainStatType" | "subStats" | "owner" | "setupIDs"
  >
>;

export class Artifact implements Clonable<Artifact> {
  public readonly subStats: ArtifactSubStat[];

  owner?: number;
  setupIDs?: number[];

  get icon() {
    return this.data[this.type].icon;
  }

  private constructor(
    public readonly ID: number,
    public readonly code: number,
    public readonly type: ArtifactType,
    public readonly rarity: number,
    public readonly level: number,
    public readonly mainStatType: AttributeStat,
    public readonly mainStatValue: number,
    subStats: ArtifactSubStat[],
    public readonly data: AppArtifact,
    relation: EquipmentRelationData = {},
  ) {
    this.subStats = Object_.clone(subStats);
    this.owner = relation.owner;
    this.setupIDs = relation.setupIDs;
  }

  updateSubStat(index: number, data: Partial<ArtifactSubStat>) {
    const subStats = this.subStats;

    if (subStats[index]) {
      Object_.patch(subStats[index], {
        type: data.type,
        value: data.value,
      });

      return subStats[index];
    }

    return null;
  }

  serialize(): RawArtifact {
    return Artifact.serialize(this);
  }

  clone(options: ArtifactCloneOptions = {}) {
    const {
      ID = this.ID,
      type = this.type,
      rarity = this.rarity,
      mainStatType = this.mainStatType,
      subStats = this.subStats,
      owner = this.owner,
      setupIDs = this.setupIDs,
    } = options;

    let { level = this.level } = options;

    if (rarity < 5 && level > 16) {
      level = 16;
    }

    return new Artifact(
      ID,
      this.code,
      type,
      rarity,
      level,
      mainStatType,
      Artifact.mainStatValueOf({ type, rarity, level, mainStatType }),
      subStats,
      this.data,
      { owner, setupIDs },
    );
  }

  // ===== STATIC =====

  static #DEFAULT_LEVEL = 1;

  static configure(config: { defaultLevel?: number }) {
    Artifact.#DEFAULT_LEVEL = config.defaultLevel ?? Artifact.#DEFAULT_LEVEL;
  }

  static create(ID: number, data: AppArtifact, options: ArtifactCreateOptions = {}) {
    const {
      type = "flower",
      level = this.#DEFAULT_LEVEL,
      rarity = 4,
      subStats = DEFAULT_SUB_STATS,
    } = options;

    const mainStatTypeSpec = mainStatTypeByAtfType(type);
    let { mainStatType } = options;

    if (mainStatType === undefined || !(mainStatType in mainStatTypeSpec.map)) {
      mainStatType = mainStatTypeSpec.default;
    }

    return new Artifact(
      ID,
      data.code,
      type,
      rarity,
      level,
      mainStatType,
      this.mainStatValueOf({ type, rarity, level, mainStatType }),
      subStats,
      data,
      options,
    );
  }

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
      },
    );
  }

  static mainStatValueOf(
    artifact: Pick<RawArtifact, "type" | "rarity" | "level" | "mainStatType">,
  ) {
    const { rarity = 5 } = artifact;
    return ARTIFACT_MAIN_STATS[artifact.type][artifact.mainStatType]?.[rarity][artifact.level] || 0;
  }

  static allMainStatTypesOf(type: ArtifactType): AttributeStat[] {
    return Object_.keys(ARTIFACT_MAIN_STATS[type] || {});
  }

  static iconOf(artifactType: ArtifactType) {
    return ARTIFACT_TYPE_ICONS.find((item) => item.type === artifactType)?.src;
  }

  static allIcons(): ArtifactTypeIcon[];
  static allIcons<T>(transform: (icons: ArtifactTypeIcon) => T): T[];
  static allIcons<T>(transform?: (icons: ArtifactTypeIcon) => T): ArtifactTypeIcon[] | T[] {
    return transform ? ARTIFACT_TYPE_ICONS.map(transform) : ARTIFACT_TYPE_ICONS;
  }
}

function mainStatTypeByAtfType(type: ArtifactType) {
  const map = ARTIFACT_MAIN_STATS[type];
  return { map, default: Object_.keys(map)[0] };
}

type ArtifactTypeIcon = { type: ArtifactType; src: string };

const ARTIFACT_TYPE_ICONS: ArtifactTypeIcon[] = [
  { type: "flower", src: "2/2d/Icon_Flower_of_Life" },
  { type: "plume", src: "8/8b/Icon_Plume_of_Death" },
  { type: "sands", src: "9/9f/Icon_Sands_of_Eon" },
  { type: "goblet", src: "3/37/Icon_Goblet_of_Eonothem" },
  { type: "circlet", src: "6/64/Icon_Circlet_of_Logos" },
];

const DEFAULT_SUB_STATS: ArtifactSubStat[] = [
  { type: "def", value: 0 },
  { type: "def_", value: 0 },
  { type: "cRate_", value: 0 },
  { type: "cDmg_", value: 0 },
];

const percent1 = {
  4: [
    6.3, 8.1, 9.9, 11.6, 13.4, 15.2, 17, 18.8, 20.6, 22.3, 24.1, 25.9, 27.7, 29.5, 31.3, 33, 34.8,
  ],
  5: [
    7, 9, 11, 12.9, 14.9, 16.9, 18.9, 20.9, 22.8, 24.8, 26.8, 28.8, 30.8, 32.8, 34.7, 36.7, 38.7,
    40.7, 42.7, 44.6, 46.6,
  ],
};

// DEF and Physical DMG (5-star)
const percent2 = {
  4: [
    7.9, 10.1, 12.3, 14.6, 16.8, 19, 21.2, 23.5, 25.7, 27.9, 30.2, 32.4, 34.6, 36.8, 39.1, 41.3,
    43.5,
  ],
  5: [
    8.7, 11.2, 13.7, 16.2, 18.6, 21.1, 23.6, 26.1, 28.6, 31, 33.5, 36, 38.5, 40.9, 43.4, 45.9, 48.4,
    50.8, 53.3, 55.8, 58.3,
  ],
};

const EM = {
  4: [25, 32, 39, 47, 54, 61, 68, 75, 82, 89, 97, 104, 111, 118, 125, 132, 139],
  5: [
    28, 36, 44, 52, 60, 68, 76, 84, 91, 99, 107, 115, 123, 131, 139, 147, 155, 163, 171, 179, 187,
  ],
};

const ARTIFACT_MAIN_STATS: Record<
  ArtifactType,
  Partial<Record<AttributeStat, { [k: number]: number[] }>>
> = {
  flower: {
    hp: {
      4: [
        645, 828, 1011, 1194, 1377, 1559, 1742, 1925, 2108, 2291, 2474, 2657, 2839, 3022, 3205,
        3388, 3571,
      ],
      5: [
        717, 920, 1123, 1326, 1530, 1733, 1936, 2139, 2342, 2545, 2749, 2952, 3155, 3358, 3561,
        3764, 3967, 4171, 4374, 4577, 4780,
      ],
    },
  },
  plume: {
    atk: {
      4: [42, 54, 66, 78, 90, 102, 113, 125, 137, 149, 161, 173, 185, 197, 209, 221, 232],
      5: [
        47, 60, 73, 86, 100, 113, 126, 139, 152, 166, 179, 192, 205, 219, 232, 245, 258, 272, 285,
        298, 311,
      ],
    },
  },
  sands: {
    hp_: percent1,
    atk_: percent1,
    def_: percent2,
    em: EM,
    er_: {
      4: [
        7, 9, 11, 12.9, 14.9, 16.9, 18.9, 20.9, 22.8, 24.8, 26.8, 28.8, 30.8, 32.8, 34.7, 36.7,
        38.7,
      ],
      5: [
        7.8, 10, 12.2, 14.4, 16.6, 18.8, 21, 23.2, 25.4, 27.6, 29.8, 32, 34.2, 38.4, 38.6, 40.8, 43,
        45.2, 47.4, 49.6, 51.8,
      ],
    },
  },
  goblet: {
    hp_: percent1,
    atk_: percent1,
    def_: percent2,
    em: EM,
    pyro: percent1,
    hydro: percent1,
    dendro: percent1,
    electro: percent1,
    anemo: percent1,
    cryo: percent1,
    geo: percent1,
    phys: percent2,
  },
  circlet: {
    hp_: percent1,
    atk_: percent1,
    def_: percent2,
    em: EM,
    cRate_: {
      4: [
        4.2, 5.4, 6.6, 7.8, 9, 10.1, 11.3, 12.5, 13.7, 14.9, 16.1, 17.3, 18.5, 19.7, 20.8, 22, 23.2,
      ],
      5: [
        4.7, 6, 7.3, 8.6, 9.9, 11.3, 12.6, 13.9, 15.2, 16.6, 17.9, 19.2, 20.5, 21.8, 23.2, 24.5,
        25.8, 27.1, 28.4, 29.8, 31.1,
      ],
    },
    cDmg_: {
      4: [
        8.4, 10.8, 13.1, 15.5, 17.9, 20.3, 22.7, 25, 27.4, 29.8, 32.2, 34.5, 36.9, 39.3, 41.7, 44.1,
        46.4,
      ],
      5: [
        9.3, 12, 14.6, 17.3, 19.9, 22.5, 25.2, 27.8, 30.5, 33.1, 35.7, 38.4, 41, 43.7, 46.3, 49,
        51.6, 54.2, 56.9, 59.5, 62.2,
      ],
    },
    healB_: {
      4: [
        4.8, 6.2, 7.6, 9, 10.3, 11.7, 13.1, 14.4, 15.8, 17.2, 18.6, 19.9, 21.3, 22.7, 24, 25.4,
        26.8,
      ],
      5: [
        5.4, 6.9, 8.4, 10, 11.5, 13, 14.5, 16.1, 17.6, 19.1, 20.6, 22.1, 23.7, 25.2, 26.7, 28.2,
        29.8, 31.3, 32.8, 34.3, 35.9,
      ],
    },
  },
};
