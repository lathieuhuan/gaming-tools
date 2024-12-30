import type { PartiallyRequiredOnly } from "rond";
import type { CalcSetup, CalcAppParty, AppCharactersByName } from "@Src/types";
import type { AppArtifact, AppWeapon } from "../types";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@Src/services";
import Array_ from "@Src/utils/array-utils";

type AppWeaponsByCode = Record<string, AppWeapon>;

type AppArtifactsByCode = Record<string, AppArtifact>;

export type DataOfSetupEntities = {
  appCharacters: AppCharactersByName;
  appWeapons: AppWeaponsByCode;
  appArtifacts: AppArtifactsByCode;
  partyData: CalcAppParty;
};

export function getDataOfSetupCharacters(character: CalcSetup["char"], party: CalcSetup["party"] = []) {
  //
  return party.reduce<AppCharactersByName>(
    (record, teammate) => {
      if (teammate) record[teammate.name] = $AppCharacter.get(teammate.name);
      return record;
    },
    {
      [character.name]: $AppCharacter.get(character.name),
    }
  );
}

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
  const partyData: CalcAppParty = [];

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
