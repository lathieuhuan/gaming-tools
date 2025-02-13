import type { PartiallyRequiredOnly } from "rond";
import type {
  CalcSetup,
  CalcAppParty,
  AppCharactersByName,
  AppArtifactsByCode,
  AppWeaponsByCode,
  SetupEntitiesData,
} from "@Src/types";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@Src/services";
import Array_ from "@Src/utils/array-utils";

export function getSetupEntitiesData({
  char,
  weapon,
  artifacts = [],
  party = [],
}: PartiallyRequiredOnly<CalcSetup, "char" | "weapon">): SetupEntitiesData {
  //
  const appCharacters: AppCharactersByName = {
    [char.name]: $AppCharacter.get(char.name),
  };
  const appWeapons: AppWeaponsByCode = {
    [weapon.code]: $AppWeapon.get(weapon.code)!,
  };
  const appArtifacts: AppArtifactsByCode = {};
  const appParty: CalcAppParty = [];

  for (const artifact of artifacts) {
    if (artifact && !appArtifacts[artifact.code]) {
      appArtifacts[artifact.code] = $AppArtifact.getSet(artifact.code)!;
    }
  }

  for (const teammate of Array_.truthy(party)) {
    if (teammate) {
      const appCharacter = $AppCharacter.get(teammate.name);

      appCharacters[teammate.name] = appCharacter;
      appWeapons[teammate.weapon.code] ||= $AppWeapon.get(teammate.weapon.code)!;
      appArtifacts[teammate.artifact.code] ||= $AppArtifact.getSet(teammate.artifact.code)!;
      appParty.push(appCharacter);
    } //
    else {
      appParty.push(null);
    }
  }

  return {
    appCharacters,
    appWeapons,
    appArtifacts,
    appParty,
  };
}
