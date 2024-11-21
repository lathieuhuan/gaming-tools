import { CalculationInfo, EffectApplicableCondition, EntityBonusBasedOn } from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { Character, PartyData } from "@Src/types";
import { EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { genCalculationInfo } from "@UnitTest/test-utils";
import { isApplicableEffect } from "../isApplicableEffect";
import { BareBonusGetter } from "../bare-bonus-getter";

export class IsApplicableEffectTester {
  info: CalculationInfo = genCalculationInfo();
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

  expectValue<T = any>(value: T) {
    return expect(isApplicableEffect(this.condition, this.info, this.inputs, this.fromSelf)).toBe<T>(value);
  }

  expectInputs(inputs: number[]) {
    return expect(isApplicableEffect(this.condition, this.info, inputs, this.fromSelf));
  }
}

export class BareBonusGetterTester extends BareBonusGetter {
  inputs: number[] = [];
  fromSelf = true;

  updateCharacter<TKey extends keyof Character>(key: TKey, value: Character[TKey]) {
    this.info.char[key] = value;
  }

  changeCharacter(characterName: EMockCharacter) {
    this.info.char.name = characterName;
    this.info.appChar = $AppCharacter.get(characterName);
  }

  changeParty(partyData: PartyData) {
    this.info.partyData = partyData;
  }

  expectBasedOn(config: EntityBonusBasedOn, basedOnStable = true) {
    return expect(
      this.getBasedOn(config, {
        inputs: this.inputs,
        fromSelf: this.fromSelf,
        basedOnStable,
      })
    );
  }
}
