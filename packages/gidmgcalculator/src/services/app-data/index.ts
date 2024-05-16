import { AppCharacterService } from "./AppCharacterService";
import { AppWeaponService } from "./AppWeaponService";
import { AppArtifactService } from "./AppArtifactService";
import { AppDataService } from "./AppDataService";
export type { Update } from "./app-data.types";

export const $AppCharacter = new AppCharacterService();
export const $AppWeapon = new AppWeaponService();
export const $AppArtifact = new AppArtifactService();
export const $AppData = new AppDataService();
