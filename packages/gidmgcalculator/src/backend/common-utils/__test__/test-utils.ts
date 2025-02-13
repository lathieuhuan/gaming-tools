import { EffectApplicableCondition } from "@Src/backend/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genCharacterDataTester, CharacterDataTester } from "@UnitTest/test-utils";
import { isApplicableEffect } from "../isApplicableEffect";

export class IsApplicableEffectTester {
  characterData: CharacterDataTester = __genCharacterDataTester();
  checkInput: EffectApplicableCondition["checkInput"];
  checkParty: EffectApplicableCondition["checkParty"];
  forElmts: EffectApplicableCondition["forElmts"];
  forWeapons: EffectApplicableCondition["forWeapons"];
  partyOnlyElmts: EffectApplicableCondition["partyOnlyElmts"];
  partyElmtCount: EffectApplicableCondition["partyElmtCount"];
  totalPartyElmtCount: EffectApplicableCondition["totalPartyElmtCount"];
  grantedAt: EffectApplicableCondition["grantedAt"];
  altIndex: EffectApplicableCondition["altIndex"];

  inputs: number[] = [];
  fromSelf = true;

  get condition(): Readonly<EffectApplicableCondition> {
    return {
      checkInput: this.checkInput,
      checkParty: this.checkParty,
      forElmts: this.forElmts,
      forWeapons: this.forWeapons,
      partyOnlyElmts: this.partyOnlyElmts,
      partyElmtCount: this.partyElmtCount,
      totalPartyElmtCount: this.totalPartyElmtCount,
      grantedAt: this.grantedAt,
      altIndex: this.altIndex,
    };
  }

  constructor(characterData?: CharacterDataTester) {
    if (characterData) {
      this.characterData = characterData;
    }
  }

  get checkInputValue(): Readonly<number> {
    const value = typeof this.checkInput === "number" ? this.checkInput : this.checkInput!.value;
    return value;
  }

  __setInfo(charName: __EMockCharacter, teammateNames: string[] = []) {
    this.characterData.__updateCharacter(charName);
    this.characterData.__updateParty(teammateNames);
  }

  __expectValue<T = any>(value: T) {
    return expect(isApplicableEffect(this.condition, this.characterData, this.inputs, this.fromSelf)).toBe<T>(value);
  }

  __expectInputs(inputs: number[]) {
    return expect(isApplicableEffect(this.condition, this.characterData, inputs, this.fromSelf));
  }
}
