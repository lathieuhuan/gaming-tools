import type { AppCharactersByName, Character, Teammate } from "@Src/types";
import type { AppCharacter, CharacterEffectLevelScale, ElementType, TalentType } from "../types";
import TypeCounter from "@Src/utils/type-counter";
import { CharacterCalc } from "./character-calc";
import { DeepReadonly } from "rond";

export class CharacterReadData {
  private _character: Character;
  private _party: (Teammate | null)[];
  private _appCharacter: AppCharacter;

  get character() {
    return this._character;
  }

  get party() {
    return this._party;
  }

  get appCharacter() {
    return this._appCharacter;
  }

  constructor(
    character: Character,
    protected data: AppCharactersByName,
    party: (Teammate | null)[] = [],
    mainAppCharacter?: AppCharacter
  ) {
    this._character = character;
    this._party = party;
    this._appCharacter = mainAppCharacter || this.getAppCharacter(character.name);
  }

  getAppCharacter(name: string) {
    const data = this.data[name];

    if (!data) {
      console.error(`Data not found for character ${name}`);
    }
    return data;
  }

  getTotalXtraTalentLv = (talentType: TalentType, character?: Character): number => {
    let _character = this.character;
    let _appCharacter = this._appCharacter;

    if (character && character?.name !== _character.name) {
      _character = character;
      _appCharacter = this.getAppCharacter(character.name);
    }

    let result = 0;

    if (talentType === "NAs") {
      if (_character.name === "Tartaglia" || this.party.some((teammate) => teammate && teammate.name === "Tartaglia")) {
        result++;
      }
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

  toCharacterData = () => {
    return new CharacterData(this.character, this.data, this.party, this.appCharacter);
  };
}

export class CharacterData extends CharacterReadData {
  public readonly elmtCount: TypeCounter<ElementType> = new TypeCounter();

  constructor(
    character: Character,
    data: AppCharactersByName,
    party: (Teammate | null)[] = [],
    appCharacter?: AppCharacter
  ) {
    super(character, data, party, appCharacter);

    for (const teammate of party) {
      if (teammate) this.elmtCount.add(this.getAppCharacter(teammate.name).vision);
    }
  }

  get allElmtCount() {
    const newCounter = new TypeCounter(this.elmtCount.result);
    newCounter.add(this.appCharacter.vision);
    return newCounter;
  }

  forEachTeammate = (callback: (data: DeepReadonly<AppCharacter>, teammate: Teammate) => void) => {
    for (const teammate of this.party) {
      if (teammate) callback(this.getAppCharacter(teammate.name), teammate);
    }
  };
}
