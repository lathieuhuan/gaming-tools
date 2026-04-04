import { Array_, Object_ } from "ron-utils";
import type { PartiallyRequiredOnly } from "rond";

import type {
  AppArtifact,
  AppCharacter,
  AppMonster,
  AppWeapon,
  RawArtifact,
  ArtifactKey,
  ArtifactStateData,
  EquipmentRelationData,
  ICharacterBasic,
  ITargetBasic,
  RawWeapon,
  MonsterInputChanges,
  WeaponStateData,
} from "@/types";

import { ATTACK_ELEMENTS } from "@/constants/global";
import {
  Artifact,
  CharacterCalc,
  Target,
  Team,
  Weapon,
  type CharacterCalcConstructInfo,
} from "@/models";
import { $AppArtifact, $AppCharacter, $AppData, $AppWeapon } from "@/services";
import { useSettingsStore } from "@Store/settings";

// ========== ARTIFACT ==========

export type CreateArtifactOptions = {
  newState?: Partial<ArtifactStateData>;
  newRelation?: Partial<EquipmentRelationData>;
};

export const createArtifact = (
  raw: PartiallyRequiredOnly<RawArtifact, keyof ArtifactKey>,
  data?: AppArtifact | null,
  options: CreateArtifactOptions = {}
) => {
  const state: Partial<ArtifactStateData> = {
    ...raw,
    ...options.newState,
  };
  const relation: Partial<EquipmentRelationData> = {
    ...raw,
    ...options.newRelation,
  };

  data ??= $AppArtifact.getSet(raw.code)!;

  return new Artifact(raw, data, { state, relation });
};

// ========== WEAPON ==========

export type CreateWeaponOptions = {
  newState?: Partial<WeaponStateData>;
  newRelation?: Partial<EquipmentRelationData>;
};

export const createWeapon = (
  raw: PartiallyRequiredOnly<RawWeapon, "type">,
  data?: AppWeapon | null,
  options: CreateWeaponOptions = {}
) => {
  const { ID = Date.now(), type, code = Weapon.DEFAULT_CODE[type] } = raw;
  const state: Partial<WeaponStateData> = {
    ...raw,
    ...options.newState,
  };
  const relation: Partial<EquipmentRelationData> = {
    ...raw,
    ...options.newRelation,
  };

  data ??= $AppWeapon.get(code)!;

  return new Weapon({ ID, type, code }, data, { state, relation });
};

// ========== ITEMS ==========

export function isWeapon(item: RawWeapon | RawArtifact): item is RawWeapon {
  return "refi" in item;
}

// ========== CHARACTER ==========

export type CreateCharacterParams = PartiallyRequiredOnly<ICharacterBasic, "code">;

export const createCharacterBasic = (params: CreateCharacterParams): ICharacterBasic => {
  const { charLevel, charCons, charNAs, charES, charEB, charEnhanced } =
    useSettingsStore.getState();

  const {
    code,
    level = charLevel,
    NAs = charNAs,
    ES = charES,
    EB = charEB,
    cons = charCons,
    enhanced = !!charEnhanced,
  } = params;

  return { code, level, NAs, ES, EB, cons, enhanced };
};

type CreateCharacterCalcParams = PartiallyRequiredOnly<
  CharacterCalcConstructInfo,
  "code" | "weapon" | "atfGear"
>;

export const createCharacterCalc = (
  params: CreateCharacterCalcParams,
  data: AppCharacter = $AppCharacter.get(params.code),
  team?: Team
) => {
  const basic = createCharacterBasic(params);

  return new CharacterCalc(
    {
      ...basic,
      weapon: params.weapon,
      atfGear: params.atfGear,
    },
    data,
    team
  );
};

// ========== TARGET ==========

export type CreateTargetParams = PartiallyRequiredOnly<ITargetBasic, "code">;

export const createTargetBasic = (params: CreateTargetParams): ITargetBasic => {
  const {
    level = useSettingsStore.getState().targetLevel,
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

  return { ...params, level, resistances: { ...resistances } };
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

  const { variantType, inputs = [] } = basic;
  const resistances = { ...basic.resistances };
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
      case "SELECT": {
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
  }

  return new Target(
    {
      ...basic,
      resistances,
    },
    data
  );
};
