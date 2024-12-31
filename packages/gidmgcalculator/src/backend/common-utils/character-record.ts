import type { AppCharactersByName, Character, Teammate } from "@Src/types";
import type { AppCharacter, CharacterEffectLevelScale, TalentType } from "../types";
import TypeCounter from "@Src/utils/type-counter";
import { PartyRecord } from "./party-record";
import { CharacterCalc } from "./character-calc";

export class CharacterRecord<T extends Teammate | null = Teammate | null> extends PartyRecord<T> {
  protected _appCharacter: AppCharacter;

  get appCharacter() {
    return this._appCharacter;
  }

  constructor(
    public readonly character: Character,
    data: AppCharactersByName,
    party: T[] = [],
    mainAppCharacter = data[character.name]
  ) {
    super(party, data);
    this._appCharacter = mainAppCharacter;
  }

  get allElmtCount() {
    const newCounter = new TypeCounter(this.elmtCount.result);
    newCounter.add(this._appCharacter.vision);
    return newCounter;
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
      if (this.character.name === "Tartaglia" || this.party.some((teammate) => teammate?.name === "Tartaglia")) {
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
}
