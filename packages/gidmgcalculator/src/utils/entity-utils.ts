import type {
  AppArtifact,
  AppMonster,
  AppWeapon,
  IArtifactBasic,
  ICharacterBasic,
  ITargetBasic,
  IWeaponBasic,
  MonsterInputChanges,
} from "@/types";
import type { AdvancedPick, PartiallyRequiredOnly } from "rond";

import { ATTACK_ELEMENTS } from "@/constants/global";
import { Artifact, Target, Weapon } from "@/models/base";
import { $AppArtifact, $AppData, $AppSettings, $AppWeapon } from "@/services";
import Array_ from "./Array";
import IdStore from "./IdStore";
import Object_ from "./Object";

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
