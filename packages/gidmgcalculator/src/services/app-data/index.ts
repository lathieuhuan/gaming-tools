import { AppCharacterService } from "./AppCharacterService";
import { AppWeaponService } from "./AppWeaponService";
import { AppArtifactService } from "./AppArtifactService";
import { AppDataService } from "./AppDataService";
export type { AllData, Update } from "./app-data.types";

const $AppCharacter = new AppCharacterService();
const $AppWeapon = new AppWeaponService();
const $AppArtifact = new AppArtifactService();
const $AppData = new AppDataService($AppCharacter, $AppWeapon, $AppArtifact);

export { $AppCharacter, $AppWeapon, $AppArtifact, $AppData };
