import { ExactOmit } from "rond";

import type { AppCharacter, Level, RawWeapon } from "@/types";

import { createWeapon } from "@/logic/entity.logic";
import { ArtifactGear } from "@/models/ArtifactGear";
import { $AppCharacter } from "@/services";
import { CharacterMock } from "@/__tests__/mocks/characters.mock";
import { Member } from "../models/Member";

type CharacterDataPatch = Partial<ExactOmit<AppCharacter, "code" | "vision" | "weaponType">>;

export function __createMember(
  options: {
    characterCode?: number;
    rawWeapon?: RawWeapon;
    level?: Level;
    dataPatch?: CharacterDataPatch;
    atfGear?: ArtifactGear;
  } = {}
) {
  const {
    characterCode = CharacterMock.PYRO_SWORD_HEXEREI,
    rawWeapon,
    level = "1/20",
    dataPatch,
    atfGear = new ArtifactGear(),
  } = options;

  const base = $AppCharacter.get(characterCode);

  if (!base) {
    throw new Error("Test setup requires populated $AppCharacter");
  }

  const appCharacter: AppCharacter = dataPatch ? { ...base, ...dataPatch } : base;

  const weapon = rawWeapon?.code
    ? createWeapon({ ...rawWeapon })
    : createWeapon({ ...rawWeapon, type: appCharacter.weaponType });

  return new Member(appCharacter.code, appCharacter, weapon, {
    state: { level },
    atfGear,
  });
}
