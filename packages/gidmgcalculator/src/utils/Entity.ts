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
  ITarget,
  ITargetBasic,
  IWeapon,
  IWeaponBasic,
  MonsterInputChanges,
} from "@/types";
import { AppMonster, AppWeapon, ArtifactType, Level, WeaponType } from "@/types";

import { ATTACK_ELEMENTS } from "@/constants";
import { $AppArtifact, $AppCharacter, $AppData, $AppSettings, $AppWeapon } from "@/services";
import { Artifact, Target, Weapon } from "@/models/base";
import Array_ from "./Array";
import Object_ from "./Object";
import IdStore from "./IdStore";

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
  "ID" | "level" | "mainStatType" | "subStats" | "owner" | "setupIDs"
>;

export const createArtifactBasic = (
  params: CreateArtifactParams,
  idStore?: IdStore
): IArtifactBasic => {
  const {
    ID = idStore?.gen() || Date.now(),
    level = $AppSettings.get("artLevel"),
    mainStatType = "hp",
    subStats = [
      { type: "def", value: 0 },
      { type: "def_", value: 0 },
      { type: "cRate_", value: 0 },
      { type: "cDmg_", value: 0 },
    ],
  } = params;

  return Object_.optionalAssign<IArtifactBasic>(
    {
      ID,
      type: params.type,
      rarity: params.rarity,
      code: params.code,
      level,
      mainStatType,
      subStats,
    },
    {
      owner: params.owner,
      setupIDs: params.setupIDs,
    }
  );
};

export const createArtifact = (
  params: CreateArtifactParams,
  data: AppArtifact = $AppArtifact.getSet(params.code)!,
  idStore?: IdStore
) => {
  return new Artifact(createArtifactBasic(params, idStore), data);
};

// ========== WEAPON ==========

export type CreateWeaponParams = PartiallyRequiredOnly<IWeaponBasic, "type">;

export const createWeaponBasic = (params: CreateWeaponParams, idStore?: IdStore): IWeaponBasic => {
  const { wpLevel, wpRefi } = $AppSettings.get();
  const { ID = idStore?.gen() || Date.now(), type, level = wpLevel, refi = wpRefi } = params;
  const code = params.code || Weapon.DEFAULT_CODE[type];

  return Object_.optionalAssign<IWeaponBasic>(
    {
      ID,
      type,
      code,
      level,
      refi,
    },
    {
      owner: params.owner,
      setupIDs: params.setupIDs,
    }
  );
};

export const createWeapon = (params: CreateWeaponParams, data?: AppWeapon, idStore?: IdStore) => {
  const basic = createWeaponBasic(params, idStore);
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

// ========== TARGET ==========

export type CreateTargetParams = PartiallyRequiredOnly<ITargetBasic, "code">;

export const createTargetBasic = (params: CreateTargetParams): ITargetBasic => {
  const { targetLevel } = $AppSettings.get();

  const {
    level = targetLevel,
    resistances = {
      pyro: 10,
      hydro: 10,
      electro: 10,
      cryo: 10,
      geo: 10,
      anemo: 10,
      dendro: 10,
      phys: 10,
    },
  } = params;

  return { ...params, level, resistances };
};

export const createTarget = (
  params: CreateTargetParams,
  data: AppMonster = params.code === 0 ? Target.DEFAULT_MONSTER : $AppData.getMonster(params)!
) => {
  const basic = createTargetBasic(params);

  if (data.code === 0) {
    // Custom target
    return new Target(basic, data);
  }

  // Target is preset monster, update resistances based on target's inputs and monster data

  const { variantType, inputs = [], resistances } = basic;
  const { resistance, variant } = data;
  const { base, ...otherResistances } = resistance;
  const inputConfigs = data.inputConfigs ? Array_.toArray(data.inputConfigs) : [];

  for (const atkElmt of ATTACK_ELEMENTS) {
    resistances[atkElmt] = otherResistances[atkElmt] ?? base;
  }

  if (variantType && variant?.change) {
    resistances[variantType] += variant.change;
  }

  const updateAsChanges = (changes: MonsterInputChanges) => {
    for (const [key, value = 0] of Object_.entries(changes)) {
      switch (key) {
        case "base":
          for (const attElmt of ATTACK_ELEMENTS) {
            resistances[attElmt] += value;
          }
          break;
        case "variant":
          if (variantType) {
            resistances[variantType] += value;
          }
          break;
        default:
          resistances[key] += value;
      }
    }
  };

  for (let index = 0; index < inputs.length; index++) {
    const config = inputConfigs[index];

    if (!config) {
      continue;
    }

    const input = inputs[index];
    const { type = "CHECK" } = config;

    switch (type) {
      case "CHECK":
        if (input && config.changes) {
          updateAsChanges(config.changes);
        }
        break;
      case "SELECT":
        if (input === -1 || !config.options) {
          continue;
        }

        const option = config.options[input];

        if (typeof option === "string") {
          if (config.optionChange) {
            resistances[option] += config.optionChange;
          }
        } else {
          updateAsChanges(option.changes);
        }
        break;
    }
  }

  return new Target(basic, data);
};

// export const createTarget = (params: CreateTargetParams, data: AppMonster): ITarget => {
//   const basic = createTargetBasic(params);

//   return new Target(basic, data);
// };

export default class Entity_ {
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

  // static createArtifact(
  //   config: AdvancedPick<
  //     Artifact,
  //     "type" | "code" | "rarity",
  //     "level" | "mainStatType" | "subStats"
  //   >,
  //   ID = Date.now()
  // ): Artifact {
  //   const { artLevel } = $AppSettings.get();
  //   const {
  //     type,
  //     rarity,
  //     level = Math.min(artLevel, rarity === 5 ? 20 : 16),
  //     subStats = [
  //       { type: "def", value: 0 },
  //       { type: "def_", value: 0 },
  //       { type: "cRate_", value: 0 },
  //       { type: "cDmg_", value: 0 },
  //     ],
  //   } = config;

  //   const allMainStatTypes = ArtifactCalc.allMainStatTypesOf(type);

  //   let mainStatType = config.mainStatType;

  //   if (!mainStatType || !allMainStatTypes.includes(mainStatType)) {
  //     mainStatType = allMainStatTypes[0];
  //   }

  //   return {
  //     ID,
  //     type,
  //     code: config.code,
  //     rarity,
  //     level,
  //     mainStatType,
  //     subStats,
  //   };
  // }

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
