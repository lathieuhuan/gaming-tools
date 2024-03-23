import { AppCharacterService } from "./AppCharacterService";
import { AppDataService } from "./AppDataService";
export type { Update } from "./app-data.types";

export const $AppData = new AppDataService();
export const $AppCharacter = new AppCharacterService();
