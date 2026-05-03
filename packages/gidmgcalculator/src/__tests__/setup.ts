import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";
import { ARTIFACT_MOCKS } from "./mocks/artifacts.mock";
import { CHARACTER_MOCKS } from "./mocks/characters.mock";
import { WEAPON_MOCKS } from "./mocks/weapons.mock";

$AppCharacter.populate(CHARACTER_MOCKS);
$AppWeapon.populate(WEAPON_MOCKS);
$AppArtifact.populate(ARTIFACT_MOCKS);
