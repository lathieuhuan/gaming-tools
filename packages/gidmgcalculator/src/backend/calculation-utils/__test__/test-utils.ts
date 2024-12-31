import { TotalAttributeControl } from "@Src/backend/controls";
import { EffectApplicableCondition } from "@Src/backend/types";
import { AppCharactersByName, CalcAppParty, Character } from "@Src/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genCalculationInfo, CharacterRecordTester } from "@UnitTest/test-utils";
import { BareBonusGetter } from "../bare-bonus-getter";
import { isApplicableEffect } from "../isApplicableEffect";

export class IsApplicableEffectTester {
  record: CharacterRecordTester = __genCalculationInfo();
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

  constructor(record?: CharacterRecordTester) {
    if (record) {
      this.record = record;
    }
  }

  get checkInputValue(): Readonly<number> {
    const value = typeof this.checkInput === "number" ? this.checkInput : this.checkInput!.value;
    return value;
  }

  _setInfo(charName: __EMockCharacter, appParty: CalcAppParty = []) {
    this.record.__updateCharacter(charName);

    const newAppParty = appParty.reduce<AppCharactersByName>(
      (result, data) => (data ? { ...result, [data.name]: data } : result),
      {}
    );

    this.record.__updateData(newAppParty);
  }

  _expectValue<T = any>(value: T) {
    return expect(isApplicableEffect(this.condition, this.record, this.inputs, this.fromSelf)).toBe<T>(value);
  }

  _expectInputs(inputs: number[]) {
    return expect(isApplicableEffect(this.condition, this.record, inputs, this.fromSelf));
  }
}

export class BareBonusGetterTester extends BareBonusGetter<CharacterRecordTester> {
  inputs: number[] = [];
  fromSelf = true;

  constructor(totalAttrCtrl?: TotalAttributeControl);
  constructor(info?: CharacterRecordTester, totalAttrCtrl?: TotalAttributeControl);
  constructor(info?: CharacterRecordTester | TotalAttributeControl, totalAttrCtrl?: TotalAttributeControl) {
    const _info = !info || info instanceof TotalAttributeControl ? __genCalculationInfo() : info;
    const _totalAttrCtrl = info instanceof TotalAttributeControl ? info : totalAttrCtrl;

    super(_info, _totalAttrCtrl);
  }

  __updateCharacter<TKey extends keyof Character>(key: TKey, value: Character[TKey]) {
    this.record.character[key] = value;
  }

  __changeCharacter(characterName: __EMockCharacter) {
    this.record.__updateCharacter(characterName);
  }

  __changeParty(appParty: CalcAppParty) {
    this.record.__updateParty(appParty);
  }
}
