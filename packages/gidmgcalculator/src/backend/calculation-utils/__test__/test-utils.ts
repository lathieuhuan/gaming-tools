import { CalculationInfo, EffectApplicableCondition } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { isApplicableEffect } from "../isApplicableEffect";
import { PartyData } from "@Src/types";

export class IsApplicableEffectTester {
  info: CalculationInfo = {
    char: {
      name: EMockCharacter.BASIC,
      level: "1/20",
      cons: 0,
      NAs: 1,
      ES: 1,
      EB: 1,
    },
    appChar: $AppCharacter.get(EMockCharacter.BASIC),
    partyData: [],
  };
  checkInput: EffectApplicableCondition["checkInput"];
  checkParty: EffectApplicableCondition["checkParty"];
  forElmts: EffectApplicableCondition["forElmts"];
  forWeapons: EffectApplicableCondition["forWeapons"];
  partyOnlyElmts: EffectApplicableCondition["partyOnlyElmts"];
  partyElmtCount: EffectApplicableCondition["partyElmtCount"];
  totalPartyElmtCount: EffectApplicableCondition["totalPartyElmtCount"];

  inputs: number[] = [];

  get condition(): Readonly<EffectApplicableCondition> {
    return {
      checkInput: this.checkInput,
      checkParty: this.checkParty,
      forElmts: this.forElmts,
      forWeapons: this.forWeapons,
      partyOnlyElmts: this.partyOnlyElmts,
      partyElmtCount: this.partyElmtCount,
      totalPartyElmtCount: this.totalPartyElmtCount,
    };
  }

  constructor(info?: CalculationInfo) {
    if (info) {
      this.info = info;
    }
  }

  get checkInputValue(): Readonly<number> {
    const value = typeof this.checkInput === "number" ? this.checkInput : this.checkInput!.value;
    return value;
  }

  setInfo(charName: EMockCharacter, partyData: PartyData = []) {
    this.info = {
      char: {
        ...this.info.char,
        name: charName,
      },
      appChar: $AppCharacter.get(charName),
      partyData,
    };
  }

  expect() {
    return expect(isApplicableEffect(this.condition, this.info, this.inputs));
  }

  expectWithInputs(inputs: number[]) {
    return expect(isApplicableEffect(this.condition, this.info, inputs));
  }
}
