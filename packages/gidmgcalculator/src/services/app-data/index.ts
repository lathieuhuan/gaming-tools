import { AppCharacterService, ConvertedCharacter } from "./AppCharacterService";
import { AppWeaponService, ConvertedWeapon } from "./AppWeaponService";
import { AppArtifactService, ConvertedArtifact } from "./AppArtifactService";
import { AppDataService } from "./AppDataService";
export type { Metadata, Update } from "./app-data.types";

const $AppCharacter = new AppCharacterService();
const $AppWeapon = new AppWeaponService();
const $AppArtifact = new AppArtifactService();
const $AppData = new AppDataService($AppCharacter, $AppWeapon, $AppArtifact);

export {
  $AppCharacter,
  $AppWeapon,
  $AppArtifact,
  $AppData,
  type ConvertedCharacter,
  type ConvertedWeapon,
  type ConvertedArtifact,
};
