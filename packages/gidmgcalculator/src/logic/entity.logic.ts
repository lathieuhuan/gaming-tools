import type { PartiallyRequiredOnly } from "rond";

import type {
  AbilityBuffCtrl,
  AbilityDebuffCtrl,
  AppArtifact,
  AppCharacter,
  AppMonster,
  AppWeapon,
  RawArtifact,
  RawCharacter,
  RawTarget,
  RawTeammate,
  RawWeapon,
  TeammateArtifact,
  TeammateWeapon,
} from "@/types";

import {
  Artifact,
  Character,
  CharacterCreateOptions,
  Target,
  Team,
  Teammate,
  Weapon,
} from "@/models";
import { $AppArtifact, $AppCharacter, $AppData, $AppWeapon } from "@/services";
import {
  createAbilityBuffCtrls,
  createAbilityDebuffCtrls,
  createWeaponBuffCtrls,
  enhanceCtrls,
} from "./modifier.logic";

// ========== ARTIFACT ==========

export type CreateArtifactOptions = Partial<
  Pick<
    RawArtifact,
    "type" | "rarity" | "level" | "mainStatType" | "subStats" | "owner" | "setupIDs"
  >
>;

export function createArtifact(
  raw: PartiallyRequiredOnly<RawArtifact, "code">,
  data?: AppArtifact | null,
  options: CreateArtifactOptions = {},
) {
  const { ID = Date.now(), code } = raw;

  if (data == null || data.code !== code) {
    data = $AppArtifact.getSet(code)!;
  }

  return Artifact.create(ID, data, { ...raw, ...options });
}

// ========== WEAPON ==========

export type CreateWeaponOptions = Partial<Pick<RawWeapon, "level" | "refi" | "owner" | "setupIDs">>;

export function createWeapon(
  raw: PartiallyRequiredOnly<RawWeapon, "type">,
  data?: AppWeapon | null,
  options: CreateWeaponOptions = {},
) {
  const { ID = Date.now(), type, code = Weapon.DEFAULT_CODE[type] } = raw;

  if (data == null || data.code !== code) {
    data = $AppWeapon.get(code)!;
  }

  return Weapon.create(ID, type, data, { ...raw, ...options });
}

// ========== ITEMS ==========

export function isWeapon(item: RawWeapon | RawArtifact): item is RawWeapon {
  return "refi" in item;
}

// ========== CHARACTER ==========

export type CreateCharacterOptions = CharacterCreateOptions & {
  weapon?: Weapon;
};

export function createCharacter(
  raw: PartiallyRequiredOnly<RawCharacter, "code">,
  data?: AppCharacter | null,
  options: CreateCharacterOptions = {},
) {
  const { code } = raw;

  if (data == null || data.code !== code) {
    data = $AppCharacter.get(code)!;
  }

  const { weapon = createWeapon({ type: data.weaponType }) } = options;

  return Character.create(data, weapon, { ...raw, ...options });
}

type CreateTeammateOptions = {
  team?: Team;
};

export function createTeammate(
  raw: PartiallyRequiredOnly<RawTeammate, "code">,
  data?: AppCharacter | null,
  options: CreateTeammateOptions = {},
) {
  data ??= $AppCharacter.get(raw.code);

  let weapon: TeammateWeapon;

  if (raw.weapon) {
    const appWeapon = $AppWeapon.get(raw.weapon.code)!;
    const { buffCtrls } = raw.weapon;

    weapon = {
      ...raw.weapon,
      buffCtrls: buffCtrls
        ? enhanceCtrls(buffCtrls, appWeapon.buffs)
        : createWeaponBuffCtrls(appWeapon, false),
      data: appWeapon,
    };
  } else {
    const code = Weapon.DEFAULT_CODE[data.weaponType];

    weapon = {
      code,
      type: data.weaponType,
      refi: 1,
      buffCtrls: [],
      data: $AppWeapon.get(code)!,
    };
  }

  const buffCtrls: AbilityBuffCtrl[] = raw.buffCtrls
    ? enhanceCtrls(raw.buffCtrls, data.buffs)
    : createAbilityBuffCtrls(data, false);

  const debuffCtrls: AbilityDebuffCtrl[] = raw.debuffCtrls
    ? enhanceCtrls(raw.debuffCtrls, data.debuffs)
    : createAbilityDebuffCtrls(data, false);

  let artifact: TeammateArtifact | undefined;

  if (raw.artifact) {
    const appArtifact = $AppArtifact.getSet(raw.artifact.code)!;

    artifact = {
      code: raw.artifact.code,
      buffCtrls: enhanceCtrls(raw.artifact.buffCtrls, appArtifact.buffs),
      data: appArtifact,
    };
  }

  return new Teammate(raw.code, data, weapon, {
    enhanced: raw.enhanced,
    buffCtrls,
    debuffCtrls,
    artifact,
    team: options.team,
  });
}

// ========== TARGET ==========

export type CreateTargetParams = PartiallyRequiredOnly<RawTarget, "code">;

export const createTarget = (codeOrRaw: number | RawTarget = 0, data?: AppMonster) => {
  if (codeOrRaw === 0) {
    return Target.default();
  }

  const code = typeof codeOrRaw === "number" ? codeOrRaw : codeOrRaw.code;

  if (data == null || data.code !== code) {
    data = $AppData.getMonster({ code })!;
  }

  if (typeof codeOrRaw === "number") {
    return Target.create(data);
  }

  return Target.fromRaw(codeOrRaw, data);
};
