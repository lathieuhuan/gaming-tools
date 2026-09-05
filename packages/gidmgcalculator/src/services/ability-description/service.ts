import { getAppCharacter } from "../app-data";
import { ServiceError } from "../ServiceError";
import type { CharacterResponseData } from "./types";

const baseUrl = "https://genshin.jmp.blue";

export async function getCharacter(code: number): Promise<CharacterResponseData> {
  const character = getAppCharacter(code);
  const response = await fetch(`${baseUrl}/characters/${character.name}`);

  if (response.ok) {
    return (await response.json()) as CharacterResponseData;
  }

  if (response.status === 404) {
    throw new ServiceError(404, "Data not found.");
  }

  throw new ServiceError(500, "Error. Rebooting...");
}
