import type { PartiallyRequiredOnly } from "rond";
import type {
  CalcSetup,
  CalcAppTeammates,
  AppCharactersByName,
  AppArtifactsByCode,
  AppWeaponsByCode,
  SetupAppEntities,
} from "@/types";
import { $AppArtifact, $AppCharacter, $AppData, $AppWeapon } from "@/services";
import Array_ from "@/utils/Array";

export function getSetupAppEntities({
  char,
  weapon,
  artifacts = [],
  party = [],
}: PartiallyRequiredOnly<CalcSetup, "char" | "weapon">): SetupAppEntities {
  //
  const appCharacters: AppCharactersByName = {
    [char.name]: $AppCharacter.get(char.name),
  };
  const appWeapons: AppWeaponsByCode = {
    [weapon.code]: $AppWeapon.get(weapon.code)!,
  };
  const appArtifacts: AppArtifactsByCode = {};
  const appTeammates: CalcAppTeammates = [];

  for (const artifact of artifacts) {
    if (artifact && !appArtifacts[artifact.code]) {
      appArtifacts[artifact.code] = $AppArtifact.getSet(artifact.code)!;
    }
  }

  for (const teammate of Array_.truthify(party)) {
    if (teammate) {
      const appCharacter = $AppCharacter.get(teammate.name);

      appCharacters[teammate.name] = appCharacter;
      appWeapons[teammate.weapon.code] ||= $AppWeapon.get(teammate.weapon.code)!;
      appArtifacts[teammate.artifact.code] ||= $AppArtifact.getSet(teammate.artifact.code)!;
      appTeammates.push(appCharacter);
    } //
    else {
      appTeammates.push(null);
    }
  }

  return {
    appCharacters,
    appWeapons,
    appArtifacts,
    appTeammates,
    appTeamBuffs: $AppData.teamBuffs,
  };
}
