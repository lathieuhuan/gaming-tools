import type { AppCharacter, ICharacterBasic } from "@/types";

export type CharacterToBeSorted = ICharacterBasic & {
  index: number;
  data: AppCharacter;
};
