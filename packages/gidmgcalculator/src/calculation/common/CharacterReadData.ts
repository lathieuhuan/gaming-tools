import type { AppCharactersByName, Character, Teammate } from "@Src/types";
import type { AppCharacter, CharacterEffectLevelScale, ElementType, PartyElementCondition, TalentType } from "../types";
import type { DeepReadonly } from "rond";
import TypeCounter from "@Src/utils/type-counter";
import { CharacterCalc } from "./CharacterCalc";

export class CharacterReadData<TMember extends Teammate | null = Teammate | null> {
  protected _character: Character;
  protected _party: TMember[];
  protected _appCharacter: AppCharacter;
  public readonly elmtCount: TypeCounter<ElementType> = new TypeCounter();

  get character() {
    return this._character;
  }

  get party() {
    return this._party;
  }

  get appCharacter() {
    return this._appCharacter;
  }

  // Include the character's element
  get allElmtCount() {
    const newCounter = new TypeCounter(this.elmtCount.result);
    newCounter.add(this.appCharacter.vision);
    return newCounter;
  }

  constructor(
    character: Character,
    protected data: AppCharactersByName,
    party: TMember[] = [],
    mainAppCharacter?: AppCharacter
  ) {
    this._character = character;
    this._party = party;
    this._appCharacter = mainAppCharacter || this.getAppCharacter(character.name);
    this.countElements();
  }

  getAppCharacter(name: string) {
    const data = this.data[name];

    if (!data) {
      console.error(`Data not found for character ${name}`);
    }
    return data;
  }

  protected countElements = () => {
    this.elmtCount.reset();

    for (const teammate of this.party) {
      if (teammate) this.elmtCount.add(this.getAppCharacter(teammate.name).vision);
    }
  };

  getTotalXtraTalentLv = (talentType: TalentType, character?: Character): number => {
    let _character = this.character;
    let _appCharacter = this._appCharacter;

    if (character && character?.name !== _character.name) {
      _character = character;
      _appCharacter = this.getAppCharacter(character.name);
    }

    let result = 0;

    switch (talentType) {
      case "NAs":
        if (
          _character.name === "Tartaglia" ||
          this.party.some((teammate) => teammate && teammate.name === "Tartaglia")
        ) {
          result++;
        }
        break;
      case "ES":
        if (_character.name === "Skirk" || this.party.some((teammate) => teammate && teammate.name === "Skirk")) {
          const isValid = this.isValidPartyElmt({
            partyOnlyElmts: ["hydro", "cryo"],
            partyElmtCount: {
              hydro: 1,
              cryo: 1,
            },
          });

          if (isValid) {
            result++;
          }
        }
        break;
    }

    if (talentType !== "altSprint") {
      const consLv = _appCharacter.talentLvBonus?.[talentType];

      if (consLv && _character.cons >= consLv) {
        result += 3;
      }
    }
    return result;
  };

  getFinalTalentLv = (talentType: TalentType, character = this.character): number => {
    const talentLv = talentType === "altSprint" ? 0 : character[talentType];
    return talentLv + this.getTotalXtraTalentLv(talentType, character);
  };

  getLevelScale = (scale: CharacterEffectLevelScale | undefined, inputs: number[], fromSelf: boolean): number => {
    if (scale) {
      const { talent, value, altIndex = 0, max } = scale;
      const level = fromSelf ? this.getFinalTalentLv(talent) : inputs[altIndex] ?? 0;

      const result = value ? CharacterCalc.getTalentMult(value, level) : level;
      return max && result > max ? max : result;
    }
    return 1;
  };

  isValidPartyElmt = (condition: PartyElementCondition) => {
    const { totalPartyElmtCount, partyElmtCount, partyOnlyElmts } = condition;
    const allElmtCount = this.allElmtCount;

    if (totalPartyElmtCount) {
      const { elements, value, comparison } = totalPartyElmtCount;

      switch (comparison) {
        case "MAX":
          if (allElmtCount.get(elements) > value) return false;
      }
    }
    if (partyElmtCount) {
      const requiredEntries = new TypeCounter(partyElmtCount).entries;

      if (requiredEntries.some(([type, value]) => allElmtCount.get(type) < value)) {
        return false;
      }
    }
    if (partyOnlyElmts && allElmtCount.keys.some((elementType) => !partyOnlyElmts.includes(elementType))) {
      return false;
    }
    return true;
  };

  clone = (appCharacter = this._appCharacter) => {
    return new CharacterReadData(this._character, this.data, this.party, appCharacter);
  };

  forEachTeammate = (callback: (data: DeepReadonly<AppCharacter>, teammate: Teammate) => void) => {
    for (const teammate of this.party) {
      if (teammate) callback(this.getAppCharacter(teammate.name), teammate);
    }
  };
}
