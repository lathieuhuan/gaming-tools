import type { AppCharacter, RawCharacter } from "@/types";

export type CharacterToBeSorted = RawCharacter & {
  index: number;
  data: AppCharacter;
};
