import type { AppCharactersByName, Teammate } from "@Src/types";
import type { AppCharacter, ElementType } from "../types";
import TypeCounter from "@Src/utils/type-counter";
import { GeneralCalc } from "./general-calc";

export class PartyRecord<T extends Teammate | null = Teammate | null> {
  public readonly elmtCount: TypeCounter<ElementType>;
  public appParty: (T extends Teammate | null ? AppCharacter | null : AppCharacter)[] = [];

  constructor(public readonly party: T[] = [], protected data: AppCharactersByName = {}) {
    this.appParty = party.map((teammate) => (teammate ? data[teammate.name] : null)) as typeof this.appParty;
    this.elmtCount = GeneralCalc.countElements(this.appParty);
  }

  getAppTeammate(name: string) {
    return this.data[name];
  }
}
