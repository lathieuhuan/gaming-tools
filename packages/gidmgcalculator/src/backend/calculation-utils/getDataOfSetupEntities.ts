import type { PartiallyRequiredOnly } from "rond";
import type { CalcSetup, PartyData } from "@Src/types";
import type { AppArtifact, AppCharacter, AppWeapon } from "../types";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@Src/services";
import Array_ from "@Src/utils/array-utils";

type AppCharactersByName = Record<string, AppCharacter>;

type AppWeaponsByCode = Record<string, AppWeapon>;

type AppArtifactsByCode = Record<string, AppArtifact>;

export type DataOfSetupEntities = {
  appCharacters: AppCharactersByName;
  appWeapons: AppWeaponsByCode;
  appArtifacts: AppArtifactsByCode;
  partyData: PartyData;
};

export function getDataOfSetupEntities({
  char,
  weapon,
  artifacts = [],
  party = [],
}: PartiallyRequiredOnly<CalcSetup, "char" | "weapon">) {
  //
  const appCharacters: AppCharactersByName = {
    [char.name]: $AppCharacter.get(char.name),
  };
  const appWeapons: AppWeaponsByCode = {
    [weapon.code]: $AppWeapon.get(weapon.code)!,
  };
  const appArtifacts: AppArtifactsByCode = {};
  const partyData: PartyData = [];

  for (const artifact of artifacts) {
    if (artifact && !appArtifacts[artifact.code]) {
      appArtifacts[artifact.code] = $AppArtifact.getSet(artifact.code)!;
    }
  }

  for (const teammate of Array_.truthy(party)) {
    if (teammate) {
      const appCharacter = $AppCharacter.get(teammate.name);

      appCharacters[teammate.name] = appCharacter;
      appWeapons[teammate.weapon.code] = $AppWeapon.get(weapon.code)!;
      appArtifacts[teammate.artifact.code] = $AppArtifact.getSet(teammate.artifact.code)!;
      partyData.push(appCharacter);
    } //
    else {
      partyData.push(null);
    }
  }

  return {
    appCharacters,
    appWeapons,
    appArtifacts,
    partyData,
  };
}
