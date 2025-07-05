import type { AppCharactersByName, Teammate } from "@Src/types";
import { CharacterReadData } from "./CharacterReadData";

export class CharacterData<TMember extends Teammate | null = Teammate | null> extends CharacterReadData<TMember> {
  //
  updateParty = (party: TMember[] = [], data: AppCharactersByName) => {
    this._party = party;
    this.data = {
      ...this.data,
      ...data,
    };
    this.countElements();
  };
}
