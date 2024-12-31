import type { AppCharactersByName, Character, Teammate } from "@Src/types";
import type { AppCharacter, TalentType } from "../types";
import TypeCounter from "@Src/utils/type-counter";
import { PartyRecord } from "./party-record";

export class CharacterRecord<T extends Teammate | null = Teammate | null> extends PartyRecord<T> {
  private _mainAppCharacter: AppCharacter;

  get mainAppCharacter() {
    return this._mainAppCharacter;
  }

  constructor(
    public readonly mainCharacter: Character,
    data: AppCharactersByName,
    public readonly party: T[] = [],
    mainAppCharacter = data[mainCharacter.name]
  ) {
    super(party, data);
    this._mainAppCharacter = mainAppCharacter;
  }

  get allElmtCount() {
    const newCounter = new TypeCounter(this.elmtCount.result);
    newCounter.add(this._mainAppCharacter.vision);
    return newCounter;
  }

  getTotalXtraTalentLv(talentType: TalentType, character?: Character): number {
    let _character = this.mainCharacter;
    let _mainAppCharacter = this.mainAppCharacter;

    if (character && character?.name !== _character.name) {
      _character = character;
      _mainAppCharacter = this.getAppCharacter(character.name);
    }

    let result = 0;

    if (talentType === "NAs") {
      if (this.mainCharacter.name === "Tartaglia" || this.party.some((teammate) => teammate?.name === "Tartaglia")) {
        result++;
      }
    }
    if (talentType !== "altSprint") {
      const consLv = _mainAppCharacter.talentLvBonus?.[talentType];

      if (consLv && _character.cons >= consLv) {
        result += 3;
      }
    }
    return result;
  }

  getFinalTalentLv(talentType: TalentType, character = this.mainCharacter): number {
    const talentLv = talentType === "altSprint" ? 0 : character[talentType];
    return talentLv + this.getTotalXtraTalentLv(talentType, character);
  }
}
