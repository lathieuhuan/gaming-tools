import type { AppCharactersByName, Character, Teammate } from "@Src/types";
import type { AppCharacter } from "../types";
import TypeCounter from "@Src/utils/type-counter";
import { PartyRecord } from "./party-record";

export class CalcCharacterRecord<T extends Teammate | null = Teammate | null> extends PartyRecord<T> {
  public appCharacter: AppCharacter;

  constructor(
    public readonly character: Character,
    public readonly party: T[] = [],
    protected data: AppCharactersByName = {},
    appCharacter = data[character.name]
  ) {
    super(party, data);
    this.appCharacter = appCharacter;
  }

  get allElmtCount() {
    const newCounter = new TypeCounter(this.elmtCount.result);
    newCounter.add(this.appCharacter.vision);
    return newCounter;
  }
}
