import type { AppCharactersByName, Teammate } from "@Src/types";
import type { AppCharacter, ElementType } from "../types";
import TypeCounter from "@Src/utils/type-counter";
import { GeneralCalc } from "./general-calc";

export class PartyRecord<T extends Teammate | null = Teammate | null> {
  public readonly elmtCount: TypeCounter<ElementType>;
  protected _party: T[] = [];
  protected _appParty: (T extends Teammate | null ? AppCharacter | null : AppCharacter)[] = [];

  get party() {
    return this._party;
  }

  get appParty() {
    return this._appParty;
  }

  constructor(party: T[] = [], protected data: AppCharactersByName = {}) {
    this._party = party;
    this._appParty = party.map((teammate) => (teammate ? data[teammate.name] : null)) as typeof this._appParty;
    this.elmtCount = GeneralCalc.countElements(this._appParty);
  }

  getAppCharacter(name: string) {
    const data = this.data[name];

    if (!data) {
      console.error(`Data not found for character ${name}`);
    }
    return data;
  }
}
