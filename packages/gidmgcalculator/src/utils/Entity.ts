import type { AdvancedPick, PartiallyRequiredOnly } from "rond";
import {
  AppArtifact,
  AppCharactersByName,
  CalcArtifact,
  CalcWeapon,
  Character,
  IArtifactBasic,
  ICharacterBasic,
  IDbArtifact,
  IDbWeapon,
  IWeapon,
  IWeaponBasic,
} from "@/types";
import {
  ATTACK_ELEMENTS,
  AppWeapon,
  ArtifactCalc,
  ArtifactType,
  Level,
  WeaponType,
} from "@Calculation";
import { $AppArtifact, $AppCharacter, $AppSettings, $AppWeapon } from "@/services";
import { Artifact, Weapon } from "@/models/base";

// ========== TYPES ==========

type CalcItemToUserItemOptions = {
  ID?: number;
  owner?: string;
  setupIDs?: number[];
};

// ========== ARTIFACT ==========

export type CreateArtifactParams = AdvancedPick<
  IArtifactBasic,
  "type" | "code" | "rarity",
  "ID" | "level" | "mainStatType" | "subStats"
>;

export const createArtifactBasic = (params: CreateArtifactParams): IArtifactBasic => {
  const {
    ID = Date.now(),
    level = $AppSettings.get("artLevel"),
    mainStatType = "hp",
    subStats = [
      { type: "def", value: 0 },
      { type: "def_", value: 0 },
      { type: "cRate_", value: 0 },
      { type: "cDmg_", value: 0 },
    ],
  } = params;

  return {
    ID,
    type: params.type,
    rarity: params.rarity,
    code: params.code,
    level,
    mainStatType,
    subStats,
  };
};

export const createArtifact = (
  params: CreateArtifactParams,
  data: AppArtifact = $AppArtifact.getSet(params.code)!
) => {
  return new Artifact(createArtifactBasic(params), data);
};

// ========== WEAPON ==========

export type CreateWeaponParams = PartiallyRequiredOnly<IWeaponBasic, "type">;

export const createWeaponBasic = (params: CreateWeaponParams): IWeaponBasic => {
  const { wpLevel, wpRefi } = $AppSettings.get();
  const { ID = Date.now(), type, level = wpLevel, refi = wpRefi } = params;
  const code = params.code || Weapon.DEFAULT_CODE[type];

  return {
    ID,
    type,
    code,
    level,
    refi,
  };
};

export const createWeapon = (params: CreateWeaponParams, data?: AppWeapon) => {
  const basic = createWeaponBasic(params);
  const data_ = data ?? $AppWeapon.get(basic.code)!;

  return new Weapon(basic, data_);
};

// ========== CHARACTER ==========

export type CreateCharacterParams = PartiallyRequiredOnly<ICharacterBasic, "name">;

export const createCharacterBasic = (params: CreateCharacterParams): ICharacterBasic => {
  const { charLevel, charCons, charNAs, charES, charEB } = $AppSettings.get();
  const {
    name,
    level = charLevel,
    NAs = charNAs,
    ES = charES,
    EB = charEB,
    cons = charCons,
    enhanced = false,
  } = params;

  return { name, level, NAs, ES, EB, cons, enhanced };
};

export default class Entity_ {
  static splitLv(subject: { level: Level }) {
    return subject.level.split("/").map((lv) => +lv);
  }

  static suffixOf(stat: string) {
    return stat.slice(-1) === "_" || ATTACK_ELEMENTS.includes(stat as any) ? "%" : "";
  }

  static getAppCharacters(
    main: string,
    teammates: ({ name: string } | null)[],
    ...extras: string[]
  ) {
    const appCharacters: AppCharactersByName = {
      [main]: $AppCharacter.get(main),
    };

    for (const teammate of teammates) {
      if (teammate) {
        appCharacters[teammate.name] = $AppCharacter.get(teammate.name);
      }
    }

    for (const extra of extras) {
      appCharacters[extra] = $AppCharacter.get(extra);
    }

    return appCharacters;
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

  static calcItemToUserItem(item: CalcArtifact, options?: CalcItemToUserItemOptions): IDbArtifact;
  static calcItemToUserItem(item: CalcWeapon, options?: CalcItemToUserItemOptions): IDbWeapon;
  static calcItemToUserItem(
    item: CalcArtifact | CalcWeapon,
    options?: CalcItemToUserItemOptions
  ): IDbArtifact | IDbWeapon {
    const { ID = item.ID, owner = null, setupIDs } = options || {};

    return {
      ...item,
      ID,
      owner,
      ...(setupIDs ? { setupIDs } : undefined),
    };
  }

  static userItemToCalcItem(item: IDbWeapon, newID?: number): CalcWeapon;
  static userItemToCalcItem(item: IDbArtifact, newID?: number): CalcArtifact;
  static userItemToCalcItem(item: IDbWeapon | IDbArtifact): CalcWeapon | CalcArtifact {
    const { owner, setupIDs, ...info } = item;
    return info;
  }
}
