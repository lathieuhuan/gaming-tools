import type { AppCharactersByName, Character, Teammate } from "@Src/types";
import type { AppCharacter, CharacterEffectLevelScale, ElementType, TalentType } from "../types";
import TypeCounter from "@Src/utils/type-counter";
import { CharacterCalc } from "./character-calc";
import { DeepReadonly } from "rond";

export class CharacterReadData<TMember extends Teammate | null = Teammate | null> {
  protected _character: Character;
  protected _party: TMember[];
  protected _appCharacter: AppCharacter;

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
    party: TMember[] = [],
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

  clone = (appCharacter = this._appCharacter) => {
    return new CharacterReadData(this._character, this.data, this.party, appCharacter);
  };

  toCharacterData = () => {
    return new CharacterData(this.character, this.data, this.party, this.appCharacter);
  };
}

export class CharacterData<TMember extends Teammate | null = Teammate | null> extends CharacterReadData<TMember> {
  public readonly elmtCount: TypeCounter<ElementType> = new TypeCounter();

  get allElmtCount() {
    const newCounter = new TypeCounter(this.elmtCount.result);
    newCounter.add(this.appCharacter.vision);
    return newCounter;
  }

  constructor(character: Character, data: AppCharactersByName, party: TMember[] = [], appCharacter?: AppCharacter) {
    super(character, data, party, appCharacter);

    this.countElement();
  }

  private countElement = () => {
    this.elmtCount.reset();

    for (const teammate of this.party) {
      if (teammate) this.elmtCount.add(this.getAppCharacter(teammate.name).vision);
    }
  };

  forEachTeammate = (callback: (data: DeepReadonly<AppCharacter>, teammate: Teammate) => void) => {
    for (const teammate of this.party) {
      if (teammate) callback(this.getAppCharacter(teammate.name), teammate);
    }
  };

  updateParty = (party: TMember[] = [], data: AppCharactersByName) => {
    this._party = party;
    this.data = {
      ...this.data,
      ...data,
    };
    this.countElement();
  };
}
