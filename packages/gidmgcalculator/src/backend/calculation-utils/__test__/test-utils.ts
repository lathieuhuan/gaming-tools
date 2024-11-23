import { TotalAttributeControl } from "@Src/backend/controls";
import {
  BareBonus,
  CalculationInfo,
  EffectApplicableCondition,
  EffectDynamicMax,
  EntityBonusBasedOn,
  EntityBonusCore,
  EntityBonusStack,
} from "@Src/backend/types";
import { $AppCharacter } from "@Src/services";
import { Character, PartyData } from "@Src/types";
import { EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { genCalculationInfo } from "@UnitTest/test-utils";
import { BareBonusGetter } from "../bare-bonus-getter";
import { isApplicableEffect } from "../isApplicableEffect";

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

  constructor(totalAttrCtrl?: TotalAttributeControl);
  constructor(info?: CalculationInfo, totalAttrCtrl?: TotalAttributeControl);
  constructor(info?: CalculationInfo | TotalAttributeControl, totalAttrCtrl?: TotalAttributeControl) {
    const _info = !info || info instanceof TotalAttributeControl ? genCalculationInfo() : info;
    const _totalAttrCtrl = info instanceof TotalAttributeControl ? info : totalAttrCtrl;

    super(_info, _totalAttrCtrl);
  }

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

  // for applyMax
}

export class BasedOnTester extends BareBonusGetterTester {
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

export class MaxTester extends BareBonusGetterTester {
  maxConfig: EffectDynamicMax = {
    value: 10,
  };
  basedOnStable?: boolean;
  refi?: number;

  clone(totalAttrCtrl?: TotalAttributeControl) {
    return new MaxTester(this.info, totalAttrCtrl);
  }

  expectMax(value: number) {
    expect(
      this.applyMax(1000_000_000, this.maxConfig, {
        inputs: this.inputs,
        fromSelf: this.fromSelf,
        basedOnStable: this.basedOnStable,
        refi: this.refi,
      })
    ).toBe(value);
  }
}

export class ApplyExtraTester extends BareBonusGetterTester {
  bonus: BareBonus = {
    id: "",
    isStable: true,
    value: 0,
  };
  extra: EntityBonusCore = {
    id: "",
    value: 0,
  };

  apply(extra: number | EntityBonusCore) {
    this.applyExtra(this.bonus, extra, { inputs: this.inputs, fromSelf: this.fromSelf });
  }

  expect(value: number, isStable?: boolean) {
    expect(this.bonus.value).toBe(value);

    if (isStable !== undefined) {
      expect(this.bonus.isStable).toBe(isStable);
    }
  }

  applyThenExpect(value: number, isStable?: boolean) {
    this.apply(this.extra);

    expect(this.bonus.value).toBe(value);

    if (isStable !== undefined) {
      expect(this.bonus.isStable).toBe(isStable);
    }
  }

  clone(totalAttrCtrl?: TotalAttributeControl) {
    return new ApplyExtraTester(this.info, totalAttrCtrl);
  }
}

export class GetStackValueTester extends BareBonusGetterTester {
  stack: EntityBonusStack = {
    type: "INPUT",
  };

  expect(stackValue: number) {
    expect(
      this.getStackValue(this.stack, {
        inputs: this.inputs,
        fromSelf: this.fromSelf,
      })
    ).toBe(stackValue);
  }
}
