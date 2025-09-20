import type { AdvancedPick } from "rond";
import type {
  Artifact,
  CalcArtifact,
  CalcWeapon,
  Character,
  UserArtifact,
  UserWeapon,
  Weapon,
} from "@/types";
import { ATTACK_ELEMENTS, ArtifactCalc, ArtifactType, Level, WeaponType } from "@Calculation";
import { $AppSettings, $AppWeapon } from "@/services";

// ========== TYPES ==========

type ArtifactTypeIcon = { value: ArtifactType; icon: string };

type CalcItemToUserItemOptions = {
  ID?: number;
  owner?: string;
  setupIDs?: number[];
};

// ========== CONSTANTS ==========

const DEFAULT_WEAPON_CODE = {
  bow: 11,
  catalyst: 36,
  claymore: 59,
  polearm: 84,
  sword: 108,
};

const ARTIFACT_TYPE_ICONS: ArtifactTypeIcon[] = [
  { value: "flower", icon: "2/2d/Icon_Flower_of_Life" },
  { value: "plume", icon: "8/8b/Icon_Plume_of_Death" },
  { value: "sands", icon: "9/9f/Icon_Sands_of_Eon" },
  { value: "goblet", icon: "3/37/Icon_Goblet_of_Eonothem" },
  { value: "circlet", icon: "6/64/Icon_Circlet_of_Logos" },
];

export default class Entity_ {
  static splitLv(subject: { level: Level }) {
    return subject.level.split("/").map((lv) => +lv);
  }

  static suffixOf(stat: string) {
    return stat.slice(-1) === "_" || ATTACK_ELEMENTS.includes(stat as any) ? "%" : "";
  }

  static createCharacter(name: string, info?: Partial<Character>): Character {
    const { charLevel, charCons, charNAs, charES, charEB } = $AppSettings.get();

    return {
      name: name,
      level: info?.level || charLevel,
      NAs: info?.NAs || charNAs,
      ES: info?.ES || charES,
      EB: info?.EB || charEB,
      cons: info?.cons || charCons,
    };
  }

  static createWeapon(
    config: AdvancedPick<Weapon, "type", "code" | "level" | "refi">,
    ID = Date.now()
  ): Weapon {
    const { wpLevel, wpRefi } = $AppSettings.get();
    const { type, code = DEFAULT_WEAPON_CODE[type] } = config;
    const { rarity } = $AppWeapon.get(code)!;
    let { level = wpLevel } = config;

    if (+level.split("/")[1] > 70 && rarity < 3) {
      level = "70/70";
    }

    return {
      ID,
      type,
      code,
      level,
      refi: config.refi || wpRefi,
    };
  }

  static getDefaultWeaponCode(type: WeaponType) {
    return DEFAULT_WEAPON_CODE[type];
  }

  static createArtifact(
    config: AdvancedPick<
      Artifact,
      "type" | "code" | "rarity",
      "level" | "mainStatType" | "subStats"
    >,
    ID = Date.now()
  ): Artifact {
    const { artLevel } = $AppSettings.get();
    const {
      type,
      rarity,
      level = Math.min(artLevel, rarity === 5 ? 20 : 16),
      subStats = [
        { type: "def", value: 0 },
        { type: "def_", value: 0 },
        { type: "cRate_", value: 0 },
        { type: "cDmg_", value: 0 },
      ],
    } = config;

    const allMainStatTypes = ArtifactCalc.allMainStatTypesOf(type);

    let mainStatType = config.mainStatType;

    if (!mainStatType || !allMainStatTypes.includes(mainStatType)) {
      mainStatType = allMainStatTypes[0];
    }

    return {
      ID,
      type,
      code: config.code,
      rarity,
      level,
      mainStatType,
      subStats,
    };
  }

  static artifactIconOf(artifactType: ArtifactType) {
    return ARTIFACT_TYPE_ICONS.find((item) => item.value === artifactType)?.icon;
  }

  static allArtifactIcons(): ArtifactTypeIcon[];
  static allArtifactIcons<T>(transform: (icons: ArtifactTypeIcon) => T): T[];
  static allArtifactIcons<T>(transform?: (icons: ArtifactTypeIcon) => T): ArtifactTypeIcon[] | T[] {
    return transform ? ARTIFACT_TYPE_ICONS.map(transform) : ARTIFACT_TYPE_ICONS;
  }

  static isWeapon<TWeapon extends Weapon, TArtifact extends Artifact>(
    item: TWeapon | TArtifact
  ): item is TWeapon {
    return "refi" in item;
  }

  static calcItemToUserItem(item: CalcArtifact, options?: CalcItemToUserItemOptions): UserArtifact;
  static calcItemToUserItem(item: CalcWeapon, options?: CalcItemToUserItemOptions): UserWeapon;
  static calcItemToUserItem(
    item: CalcArtifact | CalcWeapon,
    options?: CalcItemToUserItemOptions
  ): UserArtifact | UserWeapon {
    const { ID = item.ID, owner = null, setupIDs } = options || {};

    return {
      ...item,
      ID,
      owner,
      ...(setupIDs ? { setupIDs } : undefined),
    };
  }

  static userItemToCalcItem(item: UserWeapon, newID?: number): CalcWeapon;
  static userItemToCalcItem(item: UserArtifact, newID?: number): CalcArtifact;
  static userItemToCalcItem(item: UserWeapon | UserArtifact): CalcWeapon | CalcArtifact {
    const { owner, setupIDs, ...info } = item;
    return info;
  }
}
